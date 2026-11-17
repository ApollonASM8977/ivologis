import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { MaintenancePriority, MaintenanceStatus, UserRole } from "@prisma/client";
import { MAINTENANCE_ISSUE_LABELS, MAINTENANCE_STATUS_LABELS } from "@ivologis/shared";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PaginationDto, toSkipTake } from "../common/dto/pagination.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { UpdateMaintenanceDto } from "./dto/update-maintenance.dto";

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateMaintenanceDto, tenantId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      include: { owner: { select: { userId: true } } },
    });
    if (!property) throw new NotFoundException("Bien introuvable.");
    if (property.currentTenantId !== tenantId) {
      throw new ForbiddenException("Vous ne pouvez signaler un problème que pour votre logement actuel.");
    }

    const request = await this.prisma.maintenanceRequest.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        issueType: dto.issueType,
        description: dto.description,
        priority: dto.priority,
        photos: dto.photos ?? [],
      },
    });

    const urgent = dto.priority === MaintenancePriority.URGENTE ? "URGENT : " : "";
    const notice = {
      type: "MAINTENANCE_NEW",
      title: `${urgent}Nouvelle demande de maintenance`,
      message: `Signalement « ${MAINTENANCE_ISSUE_LABELS[dto.issueType]} » sur ${property.name}, envoyé par le locataire.`,
    };
    // Toute l'équipe (super admins et agents), pas seulement les super admins.
    await this.notifications.notifyStaff(notice);
    if (property.owner?.userId) await this.notifications.notify({ userId: property.owner.userId, ...notice });

    return request;
  }

  async findAll(
    pagination: PaginationDto,
    scope: { ownerId?: string; tenantId?: string },
    status?: MaintenanceStatus,
  ) {
    const { skip, take } = toSkipTake(pagination);
    const where: any = {
      ...(status ? { status } : {}),
      ...(scope.tenantId ? { tenantId: scope.tenantId } : {}),
      ...(scope.ownerId ? { property: { ownerId: scope.ownerId } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          tenant: { select: { id: true, fullName: true, phone: true } },
          property: { select: { id: true, name: true, commune: true, ownerId: true } },
          technician: true,
        },
      }),
      this.prisma.maintenanceRequest.count({ where }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: true,
        technician: true,
        comments: { include: { author: { select: { fullName: true, role: true } } }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!request) throw new NotFoundException("Demande de maintenance introuvable.");
    return request;
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...dto,
        resolvedAt: dto.status === MaintenanceStatus.RESOLU ? new Date() : undefined,
      },
    });

    if (existing.tenant.userId) {
      const statusChanged = dto.status && dto.status !== existing.status;
      const technicianAssigned = dto.technicianId && dto.technicianId !== existing.technicianId;
      if (statusChanged || technicianAssigned) {
        const technician = technicianAssigned
          ? await this.prisma.technician.findUnique({ where: { id: dto.technicianId! }, select: { fullName: true } })
          : null;
        const parts = [
          statusChanged ? `statut : ${MAINTENANCE_STATUS_LABELS[dto.status!].toLowerCase()}` : null,
          technician ? `intervenant : ${technician.fullName}` : null,
        ].filter(Boolean);
        await this.notifications.notify({
          userId: existing.tenant.userId,
          type: dto.status === MaintenanceStatus.RESOLU ? "MAINTENANCE_RESOLVED" : "MAINTENANCE_UPDATE",
          title: dto.status === MaintenanceStatus.RESOLU ? "Demande de maintenance résolue" : "Votre demande de maintenance avance",
          message: `« ${existing.property.name} » : ${parts.join(", ")}.`,
        });
      }
    }

    return updated;
  }

  async addComment(maintenanceRequestId: string, author: AuthenticatedUser, comment: string) {
    const authorId = author.id;
    const request = await this.findOne(maintenanceRequestId);
    if (!comment?.trim()) throw new BadRequestException("Le commentaire ne peut pas être vide.");

    const created = await this.prisma.maintenanceComment.create({
      data: { maintenanceRequestId, authorId, comment: comment.trim() },
      include: { author: { select: { fullName: true, role: true } } },
    });

    const isStaff = author.role === UserRole.SUPER_ADMIN || author.role === UserRole.ADMIN_AGENT;
    if (!isStaff) {
      await this.notifications.notifyStaff({
        type: "MAINTENANCE_COMMENT",
        title: "Nouveau message sur une demande de maintenance",
        message: `${created.author.fullName} a écrit au sujet de « ${request.property.name} ».`,
      });
    }

    const property = await this.prisma.property.findUnique({
      where: { id: request.propertyId },
      include: { owner: { select: { userId: true } } },
    });

    const recipients = new Set<string>();
    if (request.tenant.userId && request.tenant.userId !== authorId) recipients.add(request.tenant.userId);
    if (property?.owner?.userId && property.owner.userId !== authorId) recipients.add(property.owner.userId);

    await Promise.all(
      Array.from(recipients).map((userId) =>
        this.notifications.notify({
          userId,
          type: "MAINTENANCE_NEW",
          title: "Nouveau commentaire",
          message: `${created.author.fullName} a commenté la demande concernant "${request.property.name}".`,
        }),
      ),
    );

    return created;
  }
}
