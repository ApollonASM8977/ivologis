import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SaleStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// Liste blanche : le catalogue est public, rien d'interne (propriétaire, acheteur, commission, locataire) n'en sort.
const PUBLIC_FIELDS = {
  id: true,
  name: true,
  type: true,
  description: true,
  address: true,
  commune: true,
  city: true,
  latitude: true,
  longitude: true,
  rooms: true,
  bedrooms: true,
  bathrooms: true,
  surfaceM2: true,
  floor: true,
  furnished: true,
  amenities: true,
  landmark: true,
  virtualTourUrl: true,
  isDemo: true,
  updatedAt: true,
  images: { select: { id: true, url: true, isCover: true }, orderBy: { isCover: "desc" } },
} satisfies Prisma.PropertySelect;

const SALE_FIELDS = {
  ...PUBLIC_FIELDS,
  salePrice: true,
  saleStatus: true,
  landTitleType: true,
  landTitleVerified: true,
} satisfies Prisma.PropertySelect;

const SHORT_STAY_FIELDS = { ...PUBLIC_FIELDS, shortStayNightlyRate: true } satisfies Prisma.PropertySelect;

const PUBLISHED_SALE = {
  forSale: true,
  archivedAt: null,
  saleStatus: { not: SaleStatus.VENDU },
  landTitleVerified: true,
} satisfies Prisma.PropertyWhereInput;

const PUBLISHED_SHORT_STAY = { shortStayEnabled: true, archivedAt: null } satisfies Prisma.PropertyWhereInput;

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listSales() {
    return this.prisma.property.findMany({ where: PUBLISHED_SALE, select: SALE_FIELDS, orderBy: { updatedAt: "desc" } });
  }

  async getSaleDetail(id: string) {
    const property = await this.prisma.property.findFirst({ where: { id, ...PUBLISHED_SALE }, select: SALE_FIELDS });
    if (!property) throw new NotFoundException("Annonce introuvable ou plus disponible.");
    await this.prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return property;
  }

  async listShortStay() {
    return this.prisma.property.findMany({ where: PUBLISHED_SHORT_STAY, select: SHORT_STAY_FIELDS, orderBy: { updatedAt: "desc" } });
  }

  async getShortStayDetail(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, ...PUBLISHED_SHORT_STAY },
      select: {
        ...SHORT_STAY_FIELDS,
        shortStayBookings: {
          where: { status: { in: ["CONFIRMEE", "EN_ATTENTE"] }, checkOut: { gte: new Date() } },
          select: { checkIn: true, checkOut: true, status: true },
        },
      },
    });
    if (!property) throw new NotFoundException("Annonce introuvable ou plus disponible.");
    await this.prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return property;
  }
}
