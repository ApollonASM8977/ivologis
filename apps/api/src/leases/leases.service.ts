import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { InspectionType, LeaseStatus, PropertyStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto, toSkipTake } from "../common/dto/pagination.dto";
import { PdfService } from "../common/pdf/pdf.service";
import { DocxService } from "../common/docx/docx.service";
import { AuditService } from "../audit/audit.service";
import { StorageService } from "../storage/storage.service";
import { SettingsService } from "../settings/settings.service";
import { PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { CreateLeaseDto } from "./dto/create-lease.dto";
import { RenewLeaseDto } from "./dto/renew-lease.dto";
import { UpdateLeaseDto } from "./dto/update-lease.dto";
import { CreateInspectionDto } from "./dto/create-inspection.dto";
import { DepositSettlementDto } from "./dto/deposit-settlement.dto";
import { RentRevisionDto } from "./dto/revision.dto";

const CONDITION_RANK: Record<string, number> = { NEUF: 0, BON: 1, USAGE: 2, DEGRADE: 3, MAUVAIS: 4 };
const DAY_MS = 24 * 60 * 60 * 1000;

interface InspectionRoom {
  name: string;
  condition: string;
  notes?: string;
  photoUrls?: string[];
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function generateContractNumber() {
  const year = new Date().getFullYear();
  return `BAIL-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

@Injectable()
export class LeasesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private docxService: DocxService,
    private audit: AuditService,
    private storage: StorageService,
    private settings: SettingsService,
  ) {}

  async create(dto: CreateLeaseDto) {
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException("Bien introuvable.");
    if (property.status === PropertyStatus.LOUE) {
      throw new BadRequestException("Ce bien est déjà loué.");
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException("Locataire introuvable.");

    return this.prisma.$transaction(async (tx) => {
      const lease = await tx.lease.create({
        data: {
          contractNumber: generateContractNumber(),
          type: dto.type,
          propertyId: dto.propertyId,
          ownerId: property.ownerId,
          tenantId: dto.tenantId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          rentAmount: dto.rentAmount,
          deposit: dto.deposit,
          advance: dto.advance,
          specialConditions: dto.specialConditions,
          details: dto.details as any,
          rentRevisionDate: addYears(new Date(dto.startDate), 1),
        },
      });

      await tx.property.update({
        where: { id: dto.propertyId },
        data: { status: PropertyStatus.LOUE, currentTenantId: dto.tenantId },
      });

      return lease;
    });
  }

  async findAll(pagination: PaginationDto, scope: { ownerId?: string; tenantId?: string }) {
    const { skip, take } = toSkipTake(pagination);
    const where = {
      ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      ...(scope.tenantId ? { tenantId: scope.tenantId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.lease.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { id: true, name: true, commune: true } },
          tenant: { select: { id: true, fullName: true, phone: true } },
          owner: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.lease.count({ where }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: { property: true, tenant: true, owner: true, payments: true },
    });
    if (!lease) throw new NotFoundException("Contrat introuvable.");
    return lease;
  }

  async update(id: string, dto: UpdateLeaseDto) {
    await this.findOne(id);
    return this.prisma.lease.update({ where: { id }, data: dto });
  }

  async renew(id: string, dto: RenewLeaseDto, actorId?: string) {
    const lease = await this.findOne(id);
    const updated = await this.prisma.lease.update({
      where: { id },
      data: {
        endDate: new Date(dto.newEndDate),
        rentAmount: dto.newRentAmount ?? lease.rentAmount,
        status: LeaseStatus.ACTIVE,
      },
    });

    await this.audit.log({
      userId: actorId,
      action: "RENEW_LEASE",
      entityType: "Lease",
      entityId: id,
      metadata: { contractNumber: lease.contractNumber, newEndDate: dto.newEndDate, newRentAmount: dto.newRentAmount },
    });

    return updated;
  }

  async terminate(id: string, actorId?: string) {
    const lease = await this.findOne(id);
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: lease.propertyId },
        data: { status: PropertyStatus.VACANT, currentTenantId: null },
      });
      return tx.lease.update({
        where: { id },
        data: { status: LeaseStatus.TERMINATED },
      });
    });

    await this.audit.log({
      userId: actorId,
      action: "TERMINATE_LEASE",
      entityType: "Lease",
      entityId: id,
      metadata: { contractNumber: lease.contractNumber },
    });

    return result;
  }

  async listInspections(leaseId: string) {
    return this.prisma.inspection.findMany({ where: { leaseId }, orderBy: { inspectionDate: "asc" } });
  }

  async addInspection(leaseId: string, dto: CreateInspectionDto, actorId?: string) {
    await this.findOne(leaseId);
    const already = await this.prisma.inspection.count({ where: { leaseId, type: dto.type } });
    if (already > 0) {
      throw new BadRequestException(
        dto.type === InspectionType.ENTREE
          ? "Un état des lieux d'entrée existe déjà pour ce bail."
          : "Un état des lieux de sortie existe déjà pour ce bail.",
      );
    }
    const inspection = await this.prisma.inspection.create({
      data: {
        leaseId,
        type: dto.type,
        inspectionDate: new Date(dto.inspectionDate),
        rooms: dto.rooms as any,
        generalNotes: dto.generalNotes ?? null,
      },
    });
    await this.audit.log({
      userId: actorId,
      action: "CREATE_INSPECTION",
      entityType: "Lease",
      entityId: leaseId,
      metadata: { type: dto.type, rooms: dto.rooms.length },
    });
    return inspection;
  }

  async compareInspections(leaseId: string) {
    const [entry, exit] = await Promise.all([
      this.prisma.inspection.findFirst({ where: { leaseId, type: InspectionType.ENTREE } }),
      this.prisma.inspection.findFirst({ where: { leaseId, type: InspectionType.SORTIE } }),
    ]);
    const entryRooms = (entry?.rooms ?? []) as unknown as InspectionRoom[];
    const exitRooms = (exit?.rooms ?? []) as unknown as InspectionRoom[];
    const rows = exitRooms.map((room) => {
      const before = entryRooms.find((r) => r.name === room.name);
      const worsened = before ? (CONDITION_RANK[room.condition] ?? 0) > (CONDITION_RANK[before.condition] ?? 0) : false;
      return {
        room: room.name,
        entryCondition: before?.condition ?? null,
        exitCondition: room.condition,
        worsened,
        exitNotes: room.notes ?? null,
        exitPhotoUrls: room.photoUrls ?? [],
      };
    });
    return { entry, exit, rows, worsenedCount: rows.filter((r) => r.worsened).length };
  }

  async settleDeposit(leaseId: string, dto: DepositSettlementDto, actorId?: string) {
    const lease = await this.findOne(leaseId);
    const ended = lease.status !== LeaseStatus.ACTIVE || new Date(lease.endDate).getTime() < Date.now();
    if (!ended) {
      throw new BadRequestException("La restitution du dépôt n'est possible qu'à la fin du bail.");
    }
    const deposit = Number(lease.deposit);
    const total = dto.deductions.reduce((sum, d) => sum + d.amount, 0);
    if (total > deposit) {
      throw new BadRequestException(`Les retenues (${total} FCFA) dépassent le dépôt de garantie (${deposit} FCFA).`);
    }
    const updated = await this.prisma.lease.update({
      where: { id: leaseId },
      data: {
        depositDeductions: dto.deductions as any,
        depositRefund: deposit - total,
        depositSettledAt: new Date(),
      },
    });
    await this.audit.log({
      userId: actorId,
      action: "SETTLE_DEPOSIT",
      entityType: "Lease",
      entityId: leaseId,
      metadata: { deposit, deductions: total, refund: deposit - total },
    });
    return updated;
  }

  async reviseRent(leaseId: string, dto: RentRevisionDto, actorId?: string) {
    const lease = await this.findOne(leaseId);
    if (lease.status !== LeaseStatus.ACTIVE) {
      throw new BadRequestException("Seul un bail actif peut être révisé.");
    }
    const oldRent = Number(lease.rentAmount);
    const rate = oldRent > 0 ? Math.round((dto.newRent / oldRent - 1) * 10000) / 100 : null;
    const effective = dto.effectiveDate ? new Date(dto.effectiveDate) : new Date();
    const updated = await this.prisma.lease.update({
      where: { id: leaseId },
      data: {
        rentAmount: dto.newRent,
        revisionRatePercent: rate,
        rentRevisionDate: addYears(effective, 1),
      },
    });
    await this.audit.log({
      userId: actorId,
      action: "REVISE_RENT",
      entityType: "Lease",
      entityId: leaseId,
      metadata: { oldRent, newRent: dto.newRent, ratePercent: rate },
    });
    return updated;
  }

  async dueRevisions(days = 30) {
    return this.prisma.lease.findMany({
      where: { status: LeaseStatus.ACTIVE, rentRevisionDate: { lte: new Date(Date.now() + days * DAY_MS) } },
      orderBy: { rentRevisionDate: "asc" },
      take: 50,
      include: {
        property: { select: { name: true } },
        tenant: { select: { fullName: true } },
      },
    });
  }

  async generateContractDocument(id: string, format: "pdf" | "docx") {
    const lease = await this.findOne(id);
    const company = await this.settings.get();

    const documentData = {
      contractNumber: lease.contractNumber,
      type: lease.type,
      companyName: company.companyName,
      companyAddress: company.address,
      companyContact: [company.phone, company.email].filter(Boolean).join(" · "),
      ownerName: lease.owner.fullName,
      ownerPhone: lease.owner.phone,
      ownerAddress: lease.owner.address,
      tenantName: lease.tenant.fullName,
      tenantPhone: lease.tenant.phone,
      tenantAddress: lease.tenant.address,
      tenantIdDocument: lease.tenant.idDocumentNumber,
      propertyName: lease.property.name,
      propertyAddress: lease.property.address,
      propertyCommune: lease.property.commune,
      propertyTypeLabel: PROPERTY_TYPE_LABELS[lease.property.type],
      surfaceM2: lease.property.surfaceM2 as any,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount as any,
      deposit: lease.deposit as any,
      advance: lease.advance as any,
      specialConditions: lease.specialConditions,
      details: lease.details as any,
    };

    if (format === "docx") {
      await this.storage.deleteByUrl(lease.wordUrl);
      const wordUrl = await this.docxService.generateContractDocx(documentData);
      return this.prisma.lease.update({ where: { id }, data: { wordUrl } });
    }

    await this.storage.deleteByUrl(lease.documentUrl);
    const documentUrl = await this.pdfService.generateContractPdf(documentData);
    return this.prisma.lease.update({ where: { id }, data: { documentUrl } });
  }

  /** À exécuter périodiquement pour marquer les contrats arrivés à échéance. */
  async expireOutdatedLeases() {
    return this.prisma.lease.updateMany({
      where: { status: LeaseStatus.ACTIVE, endDate: { lt: new Date() } },
      data: { status: LeaseStatus.EXPIRED },
    });
  }
}
