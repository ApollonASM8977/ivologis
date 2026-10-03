import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AccountStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto, toSkipTake } from "../common/dto/pagination.dto";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async importRows(rows: unknown[]) {
    const errors: { line: number; message: string }[] = [];
    let created = 0;
    for (const [index, raw] of rows.entries()) {
      const line = index + 2;
      const dto = plainToInstance(CreateTenantDto, raw as Record<string, unknown>);
      const problems = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
      if (problems.length) {
        errors.push({ line, message: problems.flatMap((p) => Object.values(p.constraints ?? {})).join(" ") });
        continue;
      }
      try {
        await this.create(dto);
        created += 1;
      } catch (error) {
        errors.push({ line, message: error instanceof Error ? error.message : "Erreur inconnue" });
      }
    }
    return { created, errors };
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findFirst({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException("Un locataire existe déjà avec ce numéro.");
    }

    const { password, ...tenantData } = dto;

    if (password) {
      return this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            fullName: dto.fullName,
            email: dto.email ?? `${dto.phone}@ivologis.local`,
            phone: dto.phone,
            passwordHash: await bcrypt.hash(password, 12),
            role: UserRole.TENANT,
            status: AccountStatus.ACTIVE,
          },
        });
        return tx.tenant.create({ data: { ...tenantData, userId: user.id } });
      });
    }

    return this.prisma.tenant.create({ data: tenantData });
  }

  async findAll(pagination: PaginationDto, ownerId?: string) {
    const { skip, take } = toSkipTake(pagination);
    const searchFilter = pagination.search
      ? {
          OR: [
            { fullName: { contains: pagination.search, mode: "insensitive" as const } },
            { phone: { contains: pagination.search } },
          ],
        }
      : {};

    const where = ownerId
      ? { ...searchFilter, leases: { some: { ownerId } } }
      : searchFilter;

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          currentProperties: { select: { id: true, name: true, commune: true } },
          leases: { where: { status: "ACTIVE" }, take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        currentProperties: true,
        leases: { include: { property: true }, orderBy: { createdAt: "desc" } },
        payments: { orderBy: { paymentDate: "desc" }, take: 12 },
        maintenanceRequests: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!tenant) throw new NotFoundException("Locataire introuvable.");
    return tenant;
  }

  async findByUserId(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { userId } });
    if (!tenant) throw new NotFoundException("Profil locataire introuvable.");
    return this.findOne(tenant.id);
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: AccountStatus) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: { status } });
  }

  /** Vérifie qu'un tenant appartient au périmètre d'un propriétaire donné (via un bail). */
  async belongsToOwner(tenantId: string, ownerId: string): Promise<boolean> {
    const count = await this.prisma.lease.count({ where: { tenantId, ownerId } });
    return count > 0;
  }
}
