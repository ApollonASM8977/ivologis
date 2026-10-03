import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { MaintenanceStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
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

    const admins = await this.prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });
    const recipients = new Set<string>(admins.map((a) => a.id));
    if (property.owner?.userId) recipients.add(property.owner.userId);

    await Promise.all(
      Array.from(recipients).map((userId) =>
        this.notifications.notify({
          userId,
          type: "MAINTENANCE_NEW",
          title: "Nouvelle demande de maintenance",
          message: `${property.name} : nouvelle demande (${dto.issueType.toLowerCase()}) signalée par le locataire.`,
        }),
      ),
    );

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

    if (dto.status === MaintenanceStatus.RESOLU && existing.tenant.userId) {
      await this.notifications.notify({
        userId: existing.tenant.userId,
        type: "MAINTENANCE_RESOLVED",
        title: "Demande de maintenance résolue",
        message: `Votre demande concernant "${existing.property.name}" a été marquée comme résolue.`,
      });
    }

    return updated;
  }

  async addComment(maintenanceRequestId: string, authorId: string, comment: string) {
    const request = await this.findOne(maintenanceRequestId);
    if (!comment?.trim()) throw new BadRequestException("Le commentaire ne peut pas être vide.");

    const created = await this.prisma.maintenanceComment.create({
      data: { maintenanceRequestId, authorId, comment },
      include: { author: { select: { fullName: true, role: true } } },
    });

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
