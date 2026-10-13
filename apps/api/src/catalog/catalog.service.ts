import { Injectable, NotFoundException } from "@nestjs/common";
import { SaleStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listSales() {
    return this.prisma.property.findMany({
      where: {
        forSale: true,
        archivedAt: null,
        saleStatus: { not: SaleStatus.VENDU },
      },
      include: {
        images: true,
        owner: { select: { id: true, fullName: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getSaleDetail(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, forSale: true },
      include: { images: true, owner: { select: { id: true, fullName: true } } },
    });
    if (!property) throw new NotFoundException("Annonce introuvable.");

    await this.prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return property;
  }

  async listShortStay() {
    return this.prisma.property.findMany({
      where: { shortStayEnabled: true, archivedAt: null },
      include: {
        images: true,
        owner: { select: { id: true, fullName: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getShortStayDetail(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, shortStayEnabled: true },
      include: {
        images: true,
        owner: { select: { id: true, fullName: true } },
        shortStayBookings: {
          where: { status: { in: ["CONFIRMEE", "EN_ATTENTE"] } },
          select: { checkIn: true, checkOut: true, status: true },
        },
      },
    });
    if (!property) throw new NotFoundException("Annonce introuvable.");

    await this.prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return property;
  }
}
