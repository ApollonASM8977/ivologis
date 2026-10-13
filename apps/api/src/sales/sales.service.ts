import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { SaleOfferStatus, SaleStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ownerScope, assertOwnsResource } from "../common/utils/scope.util";
import { SetSaleDto } from "./dto/set-sale.dto";
import { CreateSaleOfferDto } from "./dto/create-offer.dto";
import { FinalizeSaleDto } from "./dto/finalize-sale.dto";

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private async getProperty(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException("Bien introuvable.");
    return property;
  }

  async listForSale(user: AuthenticatedUser) {
    const scopedOwnerId = ownerScope(user);
    return this.prisma.property.findMany({
      where: {
        forSale: true,
        ...(scopedOwnerId ? { ownerId: scopedOwnerId } : {}),
      },
      include: {
        owner: { select: { id: true, fullName: true, phone: true } },
        images: { where: { isCover: true }, take: 1 },
        saleOffers: { orderBy: { createdAt: "desc" }, take: 3 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async setSale(propertyId: string, dto: SetSaleDto, user: AuthenticatedUser, actorId?: string) {
    const property = await this.getProperty(propertyId);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, property.ownerId);

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        forSale: dto.forSale,
        salePrice: dto.forSale ? dto.salePrice : null,
        saleCommissionRate: dto.forSale ? dto.saleCommissionRate : null,
        saleStatus: SaleStatus.DISPONIBLE,
      },
    });

    await this.audit.log({
      userId: actorId,
      action: dto.forSale ? "LIST_PROPERTY_FOR_SALE" : "UNLIST_PROPERTY_FOR_SALE",
      entityType: "Property",
      entityId: propertyId,
      metadata: { salePrice: dto.salePrice },
    });

    return updated;
  }

  async listOffers(propertyId: string, user: AuthenticatedUser) {
    const property = await this.getProperty(propertyId);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, property.ownerId);
    return this.prisma.propertySaleOffer.findMany({ where: { propertyId }, orderBy: { createdAt: "desc" } });
  }

  async addOffer(propertyId: string, dto: CreateSaleOfferDto, actorId?: string) {
    const property = await this.getProperty(propertyId);
    if (!property.forSale) {
      throw new BadRequestException("Ce bien n'est pas en vente.");
    }
    if (property.saleStatus === SaleStatus.VENDU) {
      throw new BadRequestException("Ce bien a déjà été vendu.");
    }

    const offer = await this.prisma.propertySaleOffer.create({
      data: {
        propertyId,
        buyerName: dto.buyerName,
        buyerPhone: dto.buyerPhone,
        offerAmount: dto.offerAmount,
        notes: dto.notes,
      },
    });

    if (property.saleStatus === SaleStatus.DISPONIBLE) {
      await this.prisma.property.update({ where: { id: propertyId }, data: { saleStatus: SaleStatus.OFFRE_RECUE } });
    }

    await this.audit.log({
      userId: actorId,
      action: "CREATE_SALE_OFFER",
      entityType: "PropertySaleOffer",
      entityId: offer.id,
      metadata: { propertyId, offerAmount: dto.offerAmount },
    });

    return offer;
  }

  async updateOfferStatus(offerId: string, status: SaleOfferStatus, actorId?: string) {
    const offer = await this.prisma.propertySaleOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException("Offre introuvable.");

    const updated = await this.prisma.propertySaleOffer.update({ where: { id: offerId }, data: { status } });

    if (status === SaleOfferStatus.ACCEPTEE) {
      await this.prisma.property.update({
        where: { id: offer.propertyId },
        data: { saleStatus: SaleStatus.SOUS_COMPROMIS },
      });
    }

    await this.audit.log({
      userId: actorId,
      action: "UPDATE_SALE_OFFER_STATUS",
      entityType: "PropertySaleOffer",
      entityId: offerId,
      metadata: { status },
    });

    return updated;
  }

  async setSaleDocument(propertyId: string, url: string, actorId?: string) {
    await this.getProperty(propertyId);
    const updated = await this.prisma.property.update({ where: { id: propertyId }, data: { saleDocumentUrl: url } });
    await this.audit.log({ userId: actorId, action: "UPLOAD_SALE_DOCUMENT", entityType: "Property", entityId: propertyId });
    return updated;
  }

  async finalize(propertyId: string, dto: FinalizeSaleDto, actorId?: string) {
    const property = await this.getProperty(propertyId);
    if (!property.forSale) {
      throw new BadRequestException("Ce bien n'est pas en vente.");
    }
    if (property.saleStatus === SaleStatus.VENDU) {
      throw new BadRequestException("Ce bien a déjà été vendu.");
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        saleStatus: SaleStatus.VENDU,
        saleFinalPrice: dto.finalPrice,
        saleBuyerName: dto.buyerName,
        saleBuyerPhone: dto.buyerPhone,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
        archivedAt: new Date(),
      },
    });

    await this.audit.log({
      userId: actorId,
      action: "FINALIZE_SALE",
      entityType: "Property",
      entityId: propertyId,
      metadata: { finalPrice: dto.finalPrice, buyerName: dto.buyerName },
    });

    return updated;
  }
}
