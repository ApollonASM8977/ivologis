import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LeaseStatus, PropertyStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto, toSkipTake } from "../common/dto/pagination.dto";
import { PdfService } from "../common/pdf/pdf.service";
import { CreateLeaseDto } from "./dto/create-lease.dto";
import { RenewLeaseDto } from "./dto/renew-lease.dto";
import { UpdateLeaseDto } from "./dto/update-lease.dto";

function generateContractNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BAIL-${year}-${random}`;
}

@Injectable()
export class LeasesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
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
          propertyId: dto.propertyId,
          ownerId: property.ownerId,
          tenantId: dto.tenantId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          rentAmount: dto.rentAmount,
          deposit: dto.deposit,
          advance: dto.advance,
          specialConditions: dto.specialConditions,
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

  async renew(id: string, dto: RenewLeaseDto) {
    const lease = await this.findOne(id);
    return this.prisma.lease.update({
      where: { id },
      data: {
        endDate: new Date(dto.newEndDate),
        rentAmount: dto.newRentAmount ?? lease.rentAmount,
        status: LeaseStatus.ACTIVE,
      },
    });
  }

  async terminate(id: string) {
    const lease = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: lease.propertyId },
        data: { status: PropertyStatus.VACANT, currentTenantId: null },
      });
      return tx.lease.update({
        where: { id },
        data: { status: LeaseStatus.TERMINATED },
      });
    });
  }

  async generateContractPdf(id: string) {
    const lease = await this.findOne(id);
    const pdfUrl = await this.pdfService.generateContractPdf({
      contractNumber: lease.contractNumber,
      companyName: "IVOLOGIS",
      ownerName: lease.owner.fullName,
      tenantName: lease.tenant.fullName,
      propertyName: lease.property.name,
      propertyAddress: `${lease.property.address}, ${lease.property.commune}`,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount as any,
      deposit: lease.deposit as any,
      advance: lease.advance as any,
      specialConditions: lease.specialConditions,
    });
    return this.prisma.lease.update({ where: { id }, data: { documentUrl: pdfUrl } });
  }

  /** À exécuter périodiquement pour marquer les contrats arrivés à échéance. */
  async expireOutdatedLeases() {
    return this.prisma.lease.updateMany({
      where: { status: LeaseStatus.ACTIVE, endDate: { lt: new Date() } },
      data: { status: LeaseStatus.EXPIRED },
    });
  }
}
