import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";

const FILE_URL_PREFIX = "/api/files/";

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  async authorizeDocument(url: string, user: AuthenticatedUser) {
    const lease = await this.prisma.lease.findFirst({
      where: { OR: [{ documentUrl: url }, { wordUrl: url }] },
      select: { ownerId: true, tenantId: true },
    });
    const receipt = lease
      ? null
      : await this.prisma.receipt.findFirst({
          where: { pdfUrl: url },
          select: { payment: { select: { ownerId: true, tenantId: true } } },
        });
    const owned = lease ?? receipt?.payment;
    if (!owned) throw new NotFoundException("Document introuvable.");

    const isStaff = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_AGENT;
    const allowed =
      isStaff ||
      (user.role === UserRole.OWNER && owned.ownerId === user.ownerId) ||
      (user.role === UserRole.TENANT && owned.tenantId === user.tenantId);
    if (!allowed) throw new ForbiddenException("Vous n'avez pas accès à ce document.");

    return url;
  }

  async save(params: { buffer: Buffer; filename: string; mimeType: string }): Promise<string> {
    const file = await this.prisma.storedFile.create({
      data: {
        filename: params.filename,
        mimeType: params.mimeType,
        size: params.buffer.length,
        data: params.buffer,
      },
      select: { id: true },
    });
    return `${FILE_URL_PREFIX}${file.id}`;
  }

  async get(id: string) {
    const file = await this.prisma.storedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException("Fichier introuvable.");
    return file;
  }

  async deleteByUrl(url?: string | null) {
    if (!url?.startsWith(FILE_URL_PREFIX)) return;
    const id = url.slice(FILE_URL_PREFIX.length);
    await this.prisma.storedFile.deleteMany({ where: { id } });
  }
}
