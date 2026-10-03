import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LeaseStatus, TenantRequestStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateTenantRequestDto } from "./dto/create-tenant-request.dto";
import { DecideTenantRequestDto } from "./dto/decide-tenant-request.dto";

@Injectable()
export class TenantRequestsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async create(tenantId: string, dto: CreateTenantRequestDto) {
    const lease = await this.prisma.lease.findFirst({
      where: { tenantId, status: LeaseStatus.ACTIVE },
      orderBy: { startDate: "desc" },
      select: { id: true, contractNumber: true, property: { select: { name: true } } },
    });
    if (!lease) throw new BadRequestException("Aucun bail actif ne vous est rattaché.");

    const request = await this.prisma.tenantRequest.create({
      data: {
        tenantId,
        leaseId: lease.id,
        type: dto.type,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        message: dto.message.trim(),
        attachmentUrl: dto.attachmentUrl ?? null,
      },
    });

    const admins = await this.prisma.user.findMany({ where: { role: UserRole.SUPER_ADMIN }, select: { id: true } });
    const title = dto.type === "RESILIATION" ? "Demande de résiliation" : "Demande du locataire";
    await Promise.all(
      admins.map((admin) =>
        this.notifications.notify({
          userId: admin.id,
          type: "TENANT_REQUEST",
          title,
          message: `${title} pour ${lease.property.name} (bail ${lease.contractNumber}).`,
        }),
      ),
    );
    return request;
  }

  async listForTenant(tenantId: string) {
    return this.prisma.tenantRequest.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 50 });
  }

  async listAll(status?: TenantRequestStatus) {
    return this.prisma.tenantRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        tenant: { select: { fullName: true, phone: true } },
        lease: { select: { contractNumber: true, endDate: true, property: { select: { name: true } } } },
      },
    });
  }

  async decide(id: string, dto: DecideTenantRequestDto, actorId?: string) {
    const request = await this.prisma.tenantRequest.findUnique({
      where: { id },
      include: { tenant: { select: { userId: true } } },
    });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (request.status !== TenantRequestStatus.EN_ATTENTE) {
      throw new BadRequestException("Cette demande a déjà été traitée.");
    }

    const updated = await this.prisma.tenantRequest.update({
      where: { id },
      data: {
        status: dto.status as TenantRequestStatus,
        adminResponse: dto.adminResponse?.trim() || null,
        handledAt: new Date(),
      },
    });

    await this.audit.log({
      userId: actorId,
      action: dto.status === "ACCEPTEE" ? "ACCEPT_TENANT_REQUEST" : "REFUSE_TENANT_REQUEST",
      entityType: "TenantRequest",
      entityId: id,
    });

    if (request.tenant.userId) {
      await this.notifications.notify({
        userId: request.tenant.userId,
        type: "TENANT_REQUEST",
        title: dto.status === "ACCEPTEE" ? "Demande acceptée" : "Demande refusée",
        message: dto.adminResponse?.trim() || "Votre agence a traité votre demande.",
      });
    }
    return updated;
  }
}
