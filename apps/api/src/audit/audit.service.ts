import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface AuditEntry {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditEntry) {
    await this.prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata as any,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  }

  async findAll(pagination: { page?: number; limit?: number } = {}) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 30;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { fullName: true, role: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, page, limit };
  }
}
