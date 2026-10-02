import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PropertyStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { toSkipTake } from "../common/dto/pagination.dto";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyFilterDto } from "./dto/property-filter.dto";

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.property.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        address: dto.address,
        commune: dto.commune,
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
        ownerId,
      },
    });
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

  async update(id: string, dto: UpdatePropertyDto) {
    await this.findOne(id);
    const { ownerId, ...rest } = dto;
    return this.prisma.property.update({ where: { id }, data: rest });
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.property.update({
      where: { id },
      data: { archivedAt: new Date(), status: PropertyStatus.SUSPENDU },
    });
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

  async removeImage(imageId: string) {
    return this.prisma.propertyImage.delete({ where: { id: imageId } });
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
