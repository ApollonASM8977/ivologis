import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";

const FILE_URL_PREFIX = "/api/files/";

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  /** Retrouve à qui appartient un document servi par lien signé (bail, quittance, pièce jointe, reçu de séjour, document de vente). */
  private async findDocumentParties(url: string): Promise<{ ownerId: string | null; tenantId: string | null; userId?: string | null } | null> {
    const lease = await this.prisma.lease.findFirst({
      where: { OR: [{ documentUrl: url }, { wordUrl: url }] },
      select: { ownerId: true, tenantId: true },
    });
    if (lease) return lease;
    const receipt = await this.prisma.receipt.findFirst({
      where: { pdfUrl: url },
      select: { payment: { select: { ownerId: true, tenantId: true } } },
    });
    if (receipt) return receipt.payment;
    const request = await this.prisma.tenantRequest.findFirst({ where: { attachmentUrl: url }, select: { tenantId: true } });
    if (request) return { ownerId: null, tenantId: request.tenantId };
    const booking = await this.prisma.shortStayBooking.findFirst({
      where: { receiptUrl: url },
      select: { ownerId: true, tenantId: true, requestedByUserId: true },
    });
    if (booking) return { ownerId: booking.ownerId, tenantId: booking.tenantId, userId: booking.requestedByUserId };
    const saleDocument = await this.prisma.propertySaleDocument.findFirst({
      where: { url },
      select: { property: { select: { ownerId: true } } },
    });
    if (saleDocument) return { ownerId: saleDocument.property.ownerId, tenantId: null };
    const soldProperty = await this.prisma.property.findFirst({ where: { saleDocumentUrl: url }, select: { ownerId: true } });
    if (soldProperty) return { ownerId: soldProperty.ownerId, tenantId: null };
    return null;
  }

  async authorizeDocument(url: string, user: AuthenticatedUser) {
    const parties = await this.findDocumentParties(url);
    if (!parties) throw new NotFoundException("Document introuvable.");

    const isStaff = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_AGENT;
    const allowed =
      isStaff ||
      (user.role === UserRole.OWNER && parties.ownerId === user.ownerId) ||
      (user.role === UserRole.TENANT && !!parties.tenantId && parties.tenantId === user.tenantId) ||
      (!!parties.userId && parties.userId === user.id);
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
