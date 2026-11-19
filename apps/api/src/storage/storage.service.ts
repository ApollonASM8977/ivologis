import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import sharp from "sharp";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";

const FILE_URL_PREFIX = "/api/files/";
const COMPRESSIBLE = /^image\/(jpeg|png|webp)$/;

/**
 * Photos envoyées depuis un téléphone (souvent 3 à 8 Mo) : redressées, réduites à 2000 px au plus, en WebP qualité 80
 * (en général 10 à 20 fois plus léger), et SANS métadonnées (la position GPS de la prise de vue disparaît).
 * Le décodage vérifie aussi que le fichier est vraiment une image (pas seulement son extension).
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer, { failOn: "error" })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new BadRequestException("Image illisible ou corrompue.");
  }
}

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrouve à qui appartient un fichier privé servi par lien signé : bail, quittance, pièce jointe, reçu de séjour,
   * document de vente, photo de maintenance ou d'état des lieux, pièce d'identité du propriétaire, photo du locataire (S-17).
   */
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
    const maintenance = await this.prisma.maintenanceRequest.findFirst({
      where: { photos: { has: url } },
      select: { tenantId: true, property: { select: { ownerId: true } } },
    });
    if (maintenance) return { ownerId: maintenance.property.ownerId, tenantId: maintenance.tenantId };
    // Photos d'état des lieux rangées dans le JSON des pièces ; `url` est toujours /api/files/<uuid> (pas de joker LIKE).
    const [inspection] = await this.prisma.$queryRaw<{ ownerId: string; tenantId: string }[]>`
      SELECT l."ownerId", l."tenantId" FROM inspections i JOIN leases l ON l.id = i."leaseId"
      WHERE i.rooms::text LIKE ${`%${url}%`} LIMIT 1`;
    if (inspection) return inspection;
    const owner = await this.prisma.owner.findFirst({ where: { idDocumentUrl: url }, select: { id: true } });
    if (owner) return { ownerId: owner.id, tenantId: null };
    const tenant = await this.prisma.tenant.findFirst({ where: { photoUrl: url }, select: { id: true } });
    if (tenant) return { ownerId: null, tenantId: tenant.id };
    return null;
  }

  /** Un fichier rattaché à un dossier privé ne s'ouvre qu'avec un lien signé ; les photos d'annonces restent publiques. */
  async isPrivate(url: string) {
    if (await this.prisma.propertyImage.findFirst({ where: { url }, select: { id: true } })) return false;
    return (await this.findDocumentParties(url)) !== null;
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
    if (COMPRESSIBLE.test(params.mimeType)) {
      params = { buffer: await optimizeImage(params.buffer), filename: params.filename.replace(/\.[^.]+$/, "") + ".webp", mimeType: "image/webp" };
    }
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
