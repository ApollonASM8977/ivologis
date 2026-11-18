import { BadRequestException, Injectable, Logger, NotFoundException, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { randomUUID } from "crypto";
import { InspectionType, Lease, LeaseStatus, PropertyStatus } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { entryCostViolation } from "../common/utils/lease-rules";
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
/** Paliers d'alerte avant la fin d'un bail, du plus proche au plus lointain. */
const EXPIRY_THRESHOLDS = [30, 60, 90];

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function frDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "UTC" });
}

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
export class LeasesService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(LeasesService.name);
  private expiryTimers: NodeJS.Timeout[] = [];

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private docxService: DocxService,
    private audit: AuditService,
    private storage: StorageService,
    private settings: SettingsService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateLeaseDto) {
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException("Bien introuvable.");
    if (property.status === PropertyStatus.LOUE) {
      throw new BadRequestException("Ce bien est déjà loué.");
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException("Locataire introuvable.");

    const violation = entryCostViolation(dto.type, Number(dto.rentAmount), Number(dto.deposit), Number(dto.advance));
    if (violation) throw new BadRequestException(violation);
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException("La date de fin du bail doit être après la date de début.");
    }

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
        data: { status: PropertyStatus.LOUE, currentTenantId: dto.tenantId, rentListed: false },
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
    // Un bail résilié ne se « ranime » pas : le bien a pu être reloué entre-temps (deux baux actifs sinon).
    if (lease.status === LeaseStatus.TERMINATED) {
      throw new BadRequestException("Ce bail a été résilié : créez un nouveau contrat.");
    }
    if (lease.property.currentTenantId && lease.property.currentTenantId !== lease.tenantId) {
      throw new BadRequestException("Le bien est occupé par un autre locataire : renouvellement impossible.");
    }
    if (new Date(dto.newEndDate) <= lease.endDate) {
      throw new BadRequestException("La nouvelle date de fin doit être après la date de fin actuelle.");
    }
    const updated = await this.prisma.lease.update({
      where: { id },
      data: {
        endDate: new Date(dto.newEndDate),
        rentAmount: dto.newRentAmount ?? lease.rentAmount,
        status: LeaseStatus.ACTIVE,
        // Nouvelle période : nouvelles alertes et nouvelle décision d'échéance.
        autoRenewMonths: null,
        expiryNoticeDays: null,
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
    // Sinon, résilier à nouveau un ancien bail libérerait un bien reloué depuis à un autre locataire.
    if (lease.status === LeaseStatus.TERMINATED) {
      throw new BadRequestException("Ce bail est déjà résilié.");
    }
    const result = await this.prisma.$transaction(async (tx) => {
      // On ne libère le bien que s'il est encore occupé par CE locataire.
      await tx.property.updateMany({
        where: { id: lease.propertyId, currentTenantId: lease.tenantId },
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

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") return;
    const run = () => this.processExpiries().catch((e) => this.logger.error(`Échéances des baux : ${e?.message ?? e}`));
    // Le plan gratuit endort le serveur : chaque réveil rattrape les échéances, puis un passage toutes les 6 h.
    this.expiryTimers = [setTimeout(run, 30_000), setInterval(run, 6 * 60 * 60 * 1000)];
    this.expiryTimers.forEach((t) => t.unref());
  }

  onModuleDestroy() {
    this.expiryTimers.forEach((t) => clearTimeout(t));
  }

  async dueExpiries(days = 90) {
    return this.prisma.lease.findMany({
      where: { status: LeaseStatus.ACTIVE, endDate: { lte: new Date(Date.now() + days * DAY_MS) } },
      orderBy: { endDate: "asc" },
      take: 50,
      select: {
        id: true,
        contractNumber: true,
        endDate: true,
        autoRenewMonths: true,
        property: { select: { name: true } },
        tenant: { select: { fullName: true } },
      },
    });
  }

  /** Décision de l'agence pour l'échéance (AD-06) ; appliquée tout de suite si la date est déjà passée. */
  async setExpiryDecision(id: string, months: number | null, actorId?: string) {
    const lease = await this.findOne(id);
    if (lease.status !== LeaseStatus.ACTIVE) {
      throw new BadRequestException("Seul un bail actif peut recevoir une décision d'échéance.");
    }
    const updated = await this.prisma.lease.update({ where: { id }, data: { autoRenewMonths: months } });
    await this.audit.log({
      userId: actorId,
      action: "LEASE_EXPIRY_DECISION",
      entityType: "Lease",
      entityId: id,
      metadata: { contractNumber: lease.contractNumber, autoRenewMonths: months },
    });
    if (months !== null && lease.owner.userId) {
      await this.notifications.notify({
        userId: lease.owner.userId,
        type: "LEASE_EXPIRY",
        title: "Échéance du bail : décision de l'agence",
        message: `Pour le bail de « ${lease.property.name} » (fin le ${frDate(lease.endDate)}), l'agence a prévu ${months === 0 ? "de ne pas le reconduire" : `une reconduction tacite de ${months} mois`}.`,
      });
    }
    if (lease.endDate <= new Date()) {
      await this.handleExpiry({ ...lease, autoRenewMonths: months }, new Date());
      return this.findOne(id);
    }
    return updated;
  }

  /** Alertes à 90, 60 et 30 jours, puis, le jour venu, application de la décision de l'agence. */
  async processExpiries(now = new Date()) {
    const leases = await this.prisma.lease.findMany({
      where: { status: LeaseStatus.ACTIVE, endDate: { lte: new Date(now.getTime() + EXPIRY_THRESHOLDS[2] * DAY_MS) } },
      include: {
        property: { select: { name: true } },
        tenant: { select: { fullName: true, userId: true } },
        owner: { select: { userId: true } },
      },
    });
    for (const lease of leases) await this.handleExpiry(lease, now);
  }

  private async handleExpiry(lease: ExpiringLease, now: Date) {
    const daysLeft = Math.ceil((lease.endDate.getTime() - now.getTime()) / DAY_MS);
    const label = `${lease.contractNumber} (${lease.property.name}, ${lease.tenant.fullName})`;
    const end = frDate(lease.endDate);
    const toParties = async (title: string, ownerMessage: string, tenantMessage: string) => {
      if (lease.owner.userId) await this.notifications.notify({ userId: lease.owner.userId, type: "LEASE_EXPIRY", title, message: ownerMessage });
      if (lease.tenant.userId) await this.notifications.notify({ userId: lease.tenant.userId, type: "LEASE_EXPIRY", title, message: tenantMessage });
    };

    if (daysLeft > 0) {
      const threshold = EXPIRY_THRESHOLDS.find((t) => daysLeft <= t);
      if (!threshold) return;
      // Réserver le palier avant d'envoyer : deux passages simultanés n'alertent qu'une fois.
      const claimed = await this.prisma.lease.updateMany({
        where: { id: lease.id, OR: [{ expiryNoticeDays: null }, { expiryNoticeDays: { gt: threshold } }] },
        data: { expiryNoticeDays: threshold },
      });
      if (!claimed.count) return;
      await this.notifications.notifyStaff({
        type: "LEASE_EXPIRY",
        title: `Bail à échéance dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`,
        message: `Le bail ${label} se termine le ${end} : ${plannedOutcome(lease.autoRenewMonths)}. Renouvelez, résiliez ou choisissez la reconduction tacite depuis la fiche du contrat.`,
      });
      if (lease.expiryNoticeDays === null && lease.owner.userId) {
        await this.notifications.notify({
          userId: lease.owner.userId,
          type: "LEASE_EXPIRY",
          title: "Bail bientôt à échéance",
          message: `Le bail de « ${lease.property.name} » se termine le ${end}. L'agence vous contactera pour la suite.`,
        });
      }
      return;
    }

    if (lease.autoRenewMonths && lease.autoRenewMonths > 0) {
      let newEnd = addMonths(lease.endDate, lease.autoRenewMonths);
      while (newEnd <= now) newEnd = addMonths(newEnd, lease.autoRenewMonths);
      // La condition sur l'ancienne date empêche une double reconduction si deux passages se croisent.
      const renewed = await this.prisma.lease.updateMany({
        where: { id: lease.id, status: LeaseStatus.ACTIVE, endDate: lease.endDate },
        data: { endDate: newEnd, expiryNoticeDays: null },
      });
      if (!renewed.count) return;
      await this.audit.log({
        action: "TACIT_RENEWAL",
        entityType: "Lease",
        entityId: lease.id,
        metadata: { contractNumber: lease.contractNumber, previousEndDate: lease.endDate, newEndDate: newEnd, months: lease.autoRenewMonths },
      });
      const until = frDate(newEnd);
      await this.notifications.notifyStaff({ type: "LEASE_EXPIRY", title: "Bail reconduit tacitement", message: `Le bail ${label} est reconduit jusqu'au ${until}.` });
      await toParties(
        "Bail reconduit",
        `Le bail de « ${lease.property.name} » est reconduit tacitement jusqu'au ${until}, aux mêmes conditions.`,
        `Votre bail pour « ${lease.property.name} » est reconduit tacitement jusqu'au ${until}, aux mêmes conditions.`,
      );
      return;
    }

    if (lease.autoRenewMonths === 0) {
      const expired = await this.prisma.lease.updateMany({
        where: { id: lease.id, status: LeaseStatus.ACTIVE },
        data: { status: LeaseStatus.EXPIRED, expiryNoticeDays: 0 },
      });
      if (!expired.count) return;
      await this.audit.log({ action: "LEASE_EXPIRED", entityType: "Lease", entityId: lease.id, metadata: { contractNumber: lease.contractNumber } });
      await this.notifications.notifyStaff({
        type: "LEASE_EXPIRY",
        title: "Bail échu, non reconduit",
        message: `Le bail ${label} est arrivé à échéance le ${end} : faites l'état des lieux de sortie, la restitution du dépôt de garantie puis la résiliation.`,
      });
      await toParties(
        "Fin du bail",
        `Le bail de « ${lease.property.name} » est arrivé à échéance le ${end} et n'est pas reconduit. L'agence organise la sortie du locataire.`,
        `Votre bail pour « ${lease.property.name} » est arrivé à échéance le ${end} et n'est pas reconduit. L'agence vous contacte pour l'état des lieux de sortie.`,
      );
      return;
    }

    // Sans décision, le bail reste actif : le locataire occupe toujours le bien et ses loyers doivent pouvoir être encaissés.
    const claimed = await this.prisma.lease.updateMany({
      where: { id: lease.id, OR: [{ expiryNoticeDays: null }, { expiryNoticeDays: { gt: 0 } }] },
      data: { expiryNoticeDays: 0 },
    });
    if (!claimed.count) return;
    await this.notifications.notifyStaff({
      type: "LEASE_EXPIRY",
      title: "Bail échu : décision à prendre",
      message: `Le bail ${label} est arrivé à échéance le ${end} sans décision. Il reste actif tant que le locataire occupe le bien : renouvelez-le, résiliez-le ou choisissez la reconduction tacite.`,
    });
  }
}

type ExpiringLease = Lease & {
  property: { name: string };
  tenant: { fullName: string; userId: string | null };
  owner: { userId: string | null };
};

function plannedOutcome(months: number | null) {
  if (months === null) return "aucune décision n'est encore prise";
  if (months === 0) return "il ne sera pas reconduit";
  return `il sera reconduit tacitement pour ${months} mois`;
}
