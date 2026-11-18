import { BadRequestException, Injectable, Logger, NotFoundException, OnApplicationBootstrap } from "@nestjs/common";
import { PropertyStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { toSkipTake } from "../common/dto/pagination.dto";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { AuditService } from "../audit/audit.service";
import { StorageService } from "../storage/storage.service";
import { TranslationService } from "../common/translation/translation.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyFilterDto } from "./dto/property-filter.dto";

const isStaff = (user: AuthenticatedUser) => user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_AGENT;

@Injectable()
export class PropertiesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private storage: StorageService,
    private translation: TranslationService,
  ) {}

  async create(dto: CreatePropertyDto, user: AuthenticatedUser) {
    let ownerId = dto.ownerId;

    if (user.role === UserRole.OWNER) {
      ownerId = user.ownerId!;
    }
    if (!ownerId) {
      throw new BadRequestException("Le propriétaire du bien est requis.");
    }

    const owner = await this.prisma.owner.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException("Propriétaire introuvable.");

    const created = await this.prisma.property.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        type: dto.type,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        address: dto.address,
        commune: dto.commune,
        neighborhood: dto.neighborhood,
        city: dto.city ?? "Abidjan",
        latitude: dto.latitude,
        longitude: dto.longitude,
        rooms: dto.rooms,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        surfaceM2: dto.surfaceM2,
        floor: dto.floor,
        yearBuilt: dto.yearBuilt,
        furnished: dto.furnished ?? false,
        amenities: dto.amenities ?? [],
        landmark: dto.landmark,
        rentAmount: dto.rentAmount,
        deposit: dto.deposit ?? 0,
        advance: dto.advance ?? 0,
        shortStayEnabled: dto.shortStayEnabled ?? false,
        shortStayNightlyRate: dto.shortStayNightlyRate,
        shortStayApproved: isStaff(user) && (dto.shortStayApproved ?? !!dto.shortStayEnabled),
        rentListed: isStaff(user) && !!dto.rentListed,
        virtualTourUrl: dto.virtualTourUrl,
        isDemo: isStaff(user) && (dto.isDemo ?? false),
        ownerId,
      },
    });
    return this.syncEnglish(created, dto);
  }

  async findAll(filter: PropertyFilterDto, user: AuthenticatedUser) {
    const { skip, take } = toSkipTake(filter);

    const where: any = {
      archivedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.commune ? { commune: filter.commune } : {}),
    };

    if (user.role === UserRole.OWNER) {
      where.ownerId = user.ownerId;
    } else if (filter.ownerId) {
      where.ownerId = filter.ownerId;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { address: { contains: filter.search, mode: "insensitive" } },
        { commune: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { id: true, fullName: true, phone: true } },
          currentTenant: { select: { id: true, fullName: true } },
          images: { where: { isCover: true }, take: 1 },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data, total, page: filter.page, limit: filter.limit };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        owner: true,
        currentTenant: true,
        images: true,
        documents: true,
        leases: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { paymentDate: "desc" }, take: 12 },
        maintenanceRequests: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!property) throw new NotFoundException("Bien introuvable.");
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, user: AuthenticatedUser) {
    await this.findOne(id);
    const { ownerId, shortStayApproved, rentListed, isDemo, ...rest } = dto;
    // Toute modification par le propriétaire retire ses annonces publiques jusqu'à une nouvelle validation de l'agence.
    const moderation = isStaff(user)
      ? { isDemo, rentListed, shortStayApproved: shortStayApproved ?? (rest.shortStayEnabled === true ? true : undefined) }
      : { shortStayApproved: false, rentListed: false };
    const updated = await this.prisma.property.update({ where: { id }, data: { ...rest, ...moderation } });
    return this.syncEnglish(updated, dto);
  }

  /** Rattrapage : annonces sans version anglaise traduites au démarrage (quand la traduction automatique est configurée). */
  onApplicationBootstrap() {
    if (!this.translation.enabled || process.env.NODE_ENV === "test") return;
    setTimeout(async () => {
      try {
        const missing = await this.prisma.property.findMany({ where: { nameEn: null }, select: { id: true, name: true, description: true }, take: 25 });
        for (const p of missing) await this.syncEnglish(p, { name: p.name, description: p.description });
        if (missing.length) this.logger.log(`${missing.length} annonce(s) traduite(s) en anglais.`);
      } catch (e) {
        this.logger.warn(`Traduction des annonces existantes : ${(e as Error).message}`);
      }
    }, 45_000).unref();
  }

  /**
   * Version anglaise (D-14) : ce que l'agence saisit prime ; sinon, un nom ou une description française modifiée est
   * traduite automatiquement. Si la traduction est indisponible, l'ancienne version anglaise est effacée plutôt que
   * de rester décalée (le site retombe alors sur le français).
   */
  private async syncEnglish<T extends { id: string; description: string | null }>(
    property: T,
    dto: { name?: string; description?: string | null; nameEn?: string; descriptionEn?: string },
  ): Promise<T> {
    const fields: ("name" | "description")[] = [];
    const data: { nameEn?: string | null; descriptionEn?: string | null } = {};
    if (dto.name !== undefined && dto.nameEn === undefined) fields.push("name");
    if (dto.description !== undefined && dto.descriptionEn === undefined) {
      if (dto.description) fields.push("description");
      else data.descriptionEn = null;
    }
    if (fields.length) {
      const english = await this.translation.toEnglish(fields.map((f) => (f === "name" ? dto.name! : dto.description!)));
      fields.forEach((f, i) => (data[f === "name" ? "nameEn" : "descriptionEn"] = english?.[i] ?? null));
    }
    if (!Object.keys(data).length) return property;
    await this.prisma.property.update({ where: { id: property.id }, data });
    return { ...property, ...data };
  }

  async archive(id: string, actorId?: string) {
    const property = await this.findOne(id);
    const activeLease = await this.prisma.lease.count({ where: { propertyId: id, status: "ACTIVE" } });
    if (activeLease) {
      throw new BadRequestException("Ce bien a un bail en cours : résiliez le bail avant d'archiver le bien.");
    }
    const updated = await this.prisma.property.update({
      where: { id },
      data: { archivedAt: new Date(), status: PropertyStatus.SUSPENDU },
    });

    await this.audit.log({
      userId: actorId,
      action: "ARCHIVE_PROPERTY",
      entityType: "Property",
      entityId: id,
      metadata: { name: property.name },
    });

    return updated;
  }

  async addImage(propertyId: string, url: string, isCover: boolean) {
    await this.findOne(propertyId);
    if (isCover) {
      await this.prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isCover: false },
      });
    }
    return this.prisma.propertyImage.create({ data: { propertyId, url, isCover } });
  }

  async findImage(imageId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: { select: { ownerId: true } } },
    });
    if (!image) throw new NotFoundException("Photo introuvable.");
    return image;
  }

  async removeImage(imageId: string) {
    const image = await this.findImage(imageId);
    await this.prisma.propertyImage.delete({ where: { id: imageId } });
    await this.storage.deleteByUrl(image.url);
    return { message: "Photo supprimée." };
  }

  async findForTenant(tenantId: string) {
    return this.prisma.property.findMany({
      where: { currentTenantId: tenantId },
      include: {
        owner: { select: { fullName: true, phone: true } },
        images: true,
        leases: { where: { status: "ACTIVE" }, take: 1 },
      },
    });
  }
}
