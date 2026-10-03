import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AccountStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { publicUser } from "../common/utils/public-user";
import { StorageService } from "../storage/storage.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private storage: StorageService,
  ) {}

  async createAdmin(dto: CreateAdminDto, actorId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new ConflictException("Un compte existe déjà avec cet email ou ce numéro.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const permissionRecords = dto.permissions?.length
      ? await this.prisma.permission.findMany({ where: { key: { in: dto.permissions } } })
      : [];

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: UserRole.ADMIN_AGENT,
        status: AccountStatus.ACTIVE,
        permissions: {
          create: permissionRecords.map((p) => ({ permissionId: p.id })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    await this.audit.log({
      userId: actorId,
      action: "CREATE_ADMIN",
      entityType: "User",
      entityId: user.id,
      metadata: { fullName: user.fullName, permissions: dto.permissions ?? [] },
    });

    return publicUser(user);
  }

  async listAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN_AGENT },
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: "desc" },
    });
    return admins.map((admin) => publicUser(admin));
  }

  async listAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => publicUser(u));
  }

  async updateStatus(id: string, status: AccountStatus, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Utilisateur introuvable.");
    const updated = await this.prisma.user.update({ where: { id }, data: { status } });

    await this.audit.log({
      userId: actorId,
      action: "UPDATE_USER_STATUS",
      entityType: "User",
      entityId: id,
      metadata: { fullName: user.fullName, previousStatus: user.status, newStatus: status },
    });

    return updated;
  }

  async updatePermissions(id: string, permissionKeys: string[], actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Utilisateur introuvable.");

    const permissionRecords = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    await this.prisma.$transaction([
      this.prisma.userPermission.deleteMany({ where: { userId: id } }),
      this.prisma.userPermission.createMany({
        data: permissionRecords.map((p) => ({ userId: id, permissionId: p.id })),
      }),
    ]);

    await this.audit.log({
      userId: actorId,
      action: "UPDATE_PERMISSIONS",
      entityType: "User",
      entityId: id,
      metadata: { fullName: user.fullName, permissions: permissionKeys },
    });

    return this.prisma.user.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async updateAvatar(id: string, url: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Utilisateur introuvable.");
    await this.storage.deleteByUrl(user.avatarUrl);
    const updated = await this.prisma.user.update({ where: { id }, data: { avatarUrl: url } });
    return publicUser(updated);
  }

  async listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { key: "asc" } });
  }
}
