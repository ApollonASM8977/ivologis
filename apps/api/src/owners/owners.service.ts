import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AccountStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto, toSkipTake } from "../common/dto/pagination.dto";
import { SettingsService } from "../settings/settings.service";
import { AuditService } from "../audit/audit.service";
import { CreatePayoutDto } from "./dto/create-payout.dto";
import { CreateOwnerDto } from "./dto/create-owner.dto";
import { UpdateOwnerDto } from "./dto/update-owner.dto";

@Injectable()
export class OwnersService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
    private audit: AuditService,
  ) {}

  async createPayout(ownerId: string, dto: CreatePayoutDto, actorId?: string) {
    await this.findOne(ownerId);
    const payout = await this.prisma.ownerPayout.create({
      data: {
        ownerId,
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference?.trim() || null,
        notes: dto.notes?.trim() || null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
    });
    await this.audit.log({
      userId: actorId,
      action: "CREATE_OWNER_PAYOUT",
      entityType: "Owner",
      entityId: ownerId,
      metadata: { amount: dto.amount, method: dto.method, reference: payout.reference },
    });
    return payout;
  }

  async listPayouts(ownerId: string) {
    return this.prisma.ownerPayout.findMany({ where: { ownerId }, orderBy: { paidAt: "desc" }, take: 100 });
  }

  async balance(ownerId: string) {
    const [collected, maintenance, paidOut, company] = await Promise.all([
      this.prisma.payment.aggregate({ where: { ownerId, status: "PAID" }, _sum: { amount: true } }),
      this.prisma.maintenanceRequest.aggregate({ where: { property: { ownerId } }, _sum: { finalCost: true } }),
      this.prisma.ownerPayout.aggregate({ where: { ownerId }, _sum: { amount: true } }),
      this.settings.get(),
    ]);
    const gross = Number(collected._sum.amount ?? 0);
    const commissionRate = Number(company.commissionRate);
    const commission = Math.round((gross * commissionRate) / 100);
    const maintenanceCosts = Number(maintenance._sum.finalCost ?? 0);
    const payouts = Number(paidOut._sum.amount ?? 0);
    return {
      gross,
      commissionRate,
      commission,
      maintenanceCosts,
      paidOut: payouts,
      balanceDue: gross - commission - maintenanceCosts - payouts,
    };
  }

  async create(dto: CreateOwnerDto) {
    const existing = await this.prisma.owner.findFirst({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException("Un propriétaire existe déjà avec ce numéro.");
    }

    const { password, ...ownerData } = dto;

    if (password) {
      return this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            fullName: dto.fullName,
            email: dto.email ?? `${dto.phone}@ivologis.local`,
            phone: dto.phone,
            passwordHash: await bcrypt.hash(password, 12),
            role: UserRole.OWNER,
            status: AccountStatus.ACTIVE,
          },
        });
        return tx.owner.create({ data: { ...ownerData, userId: user.id } });
      });
    }

    return this.prisma.owner.create({ data: ownerData });
  }

  async findAll(pagination: PaginationDto) {
    const { skip, take } = toSkipTake(pagination);
    const where = pagination.search
      ? {
          OR: [
            { fullName: { contains: pagination.search, mode: "insensitive" as const } },
            { phone: { contains: pagination.search } },
            { email: { contains: pagination.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.owner.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { properties: true } } },
      }),
      this.prisma.owner.count({ where }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
      include: {
        properties: true,
        _count: { select: { properties: true, leases: true, payments: true } },
      },
    });
    if (!owner) throw new NotFoundException("Propriétaire introuvable.");
    return owner;
  }

  async findByUserId(userId: string) {
    const owner = await this.prisma.owner.findUnique({ where: { userId } });
    if (!owner) throw new NotFoundException("Profil propriétaire introuvable.");
    return this.findOne(owner.id);
  }

  async update(id: string, dto: UpdateOwnerDto) {
    await this.findOne(id);
    return this.prisma.owner.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: AccountStatus) {
    await this.findOne(id);
    return this.prisma.owner.update({ where: { id }, data: { status } });
  }

  async revenueSummary(id: string) {
    const [propertiesCount, paidPayments] = await Promise.all([
      this.prisma.property.count({ where: { ownerId: id } }),
      this.prisma.payment.aggregate({
        where: { ownerId: id, status: "PAID" },
        _sum: { amount: true },
      }),
    ]);
    return {
      propertiesCount,
      totalRevenue: paidPayments._sum.amount ?? 0,
    };
  }
}
