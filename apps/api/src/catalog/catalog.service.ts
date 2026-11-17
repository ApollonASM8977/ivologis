import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PropertyStatus, SaleStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogFilterDto } from "./dto/catalog-filter.dto";

// Liste blanche : le catalogue est public, rien d'interne (propriétaire, acheteur, commission, locataire) n'en sort.
const PUBLIC_FIELDS = {
  id: true,
  name: true,
  type: true,
  description: true,
  address: true,
  commune: true,
  neighborhood: true,
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

const RENTAL_FIELDS = { ...PUBLIC_FIELDS, rentAmount: true, deposit: true, advance: true } satisfies Prisma.PropertySelect;

const PUBLISHED_RENTAL = {
  rentListed: true,
  status: PropertyStatus.VACANT,
  archivedAt: null,
  rentAmount: { gt: 0 },
} satisfies Prisma.PropertyWhereInput;

const PUBLISHED_SALE = {
  forSale: true,
  archivedAt: null,
  saleStatus: { not: SaleStatus.VENDU },
  landTitleVerified: true,
} satisfies Prisma.PropertyWhereInput;

const PUBLISHED_SHORT_STAY = { shortStayEnabled: true, shortStayApproved: true, archivedAt: null } satisfies Prisma.PropertyWhereInput;

type PriceField = "salePrice" | "rentAmount" | "shortStayNightlyRate";

function filterWhere(f: CatalogFilterDto, priceField: PriceField): Prisma.PropertyWhereInput {
  const price: Prisma.DecimalFilter = {};
  if (f.minPrice != null) price.gte = f.minPrice;
  if (f.maxPrice != null) price.lte = f.maxPrice;
  return {
    ...(f.zone
      ? { OR: [{ commune: { equals: f.zone, mode: "insensitive" } }, { city: { equals: f.zone, mode: "insensitive" } }] }
      : {}),
    ...(f.neighborhood ? { neighborhood: { contains: f.neighborhood, mode: "insensitive" } } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.minRooms ? { rooms: { gte: f.minRooms } } : {}),
    ...(f.furnished ? { furnished: true } : {}),
    ...(Object.keys(price).length ? { [priceField]: price } : {}),
  };
}

function filterOrder(f: CatalogFilterDto, priceField: PriceField): Prisma.PropertyOrderByWithRelationInput {
  if (f.sort === "price_asc") return { [priceField]: "asc" };
  if (f.sort === "price_desc") return { [priceField]: "desc" };
  return { updatedAt: "desc" };
}

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  private async search<S extends Prisma.PropertySelect>(
    published: Prisma.PropertyWhereInput,
    select: S,
    priceField: PriceField,
    f: CatalogFilterDto,
  ) {
    const page = f.page ?? 1;
    const limit = f.limit ?? 24;
    const where = { AND: [published, filterWhere(f, priceField)] };
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({ where, select, orderBy: filterOrder(f, priceField), skip: (page - 1) * limit, take: limit }),
      this.prisma.property.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  private countView(id: string, countView: boolean) {
    return countView ? this.prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } }) : null;
  }

  listSales(f: CatalogFilterDto = {}) {
    return this.search(PUBLISHED_SALE, SALE_FIELDS, "salePrice", f);
  }

  async getSaleDetail(id: string, countView = true) {
    const property = await this.prisma.property.findFirst({ where: { id, ...PUBLISHED_SALE }, select: SALE_FIELDS });
    if (!property) throw new NotFoundException("Annonce introuvable ou plus disponible.");
    await this.countView(id, countView);
    return property;
  }

  listRentals(f: CatalogFilterDto = {}) {
    return this.search(PUBLISHED_RENTAL, RENTAL_FIELDS, "rentAmount", f);
  }

  async getRentalDetail(id: string, countView = true) {
    const property = await this.prisma.property.findFirst({ where: { id, ...PUBLISHED_RENTAL }, select: RENTAL_FIELDS });
    if (!property) throw new NotFoundException("Annonce introuvable ou plus disponible.");
    await this.countView(id, countView);
    return property;
  }

  listShortStay(f: CatalogFilterDto = {}) {
    return this.search(PUBLISHED_SHORT_STAY, SHORT_STAY_FIELDS, "shortStayNightlyRate", f);
  }

  async getShortStayDetail(id: string, countView = true) {
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
    await this.countView(id, countView);
    return property;
  }
}
