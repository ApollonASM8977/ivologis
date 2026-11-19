import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PropertyStatus, SaleDocumentType, SaleOfferStatus, SaleStatus, UserRole, VisitRequestStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ownerScope, assertOwnsResource } from "../common/utils/scope.util";
import { generateReference } from "../common/utils/reference.util";
import { SetSaleDto } from "./dto/set-sale.dto";
import { CreateSaleOfferDto } from "./dto/create-offer.dto";
import { FinalizeSaleDto } from "./dto/finalize-sale.dto";
import { CreateVisitRequestDto } from "./dto/create-visit-request.dto";
import { ScheduleVisitDto } from "./dto/schedule-visit.dto";
import { UploadSaleDocumentDto } from "./dto/upload-sale-document.dto";

const LAND_TITLE_NOT_VERIFIED = {
  landTitleVerified: false,
  landTitleVerifiedAt: null,
  landTitleVerifiedBy: null,
  landTitleDocumentId: null,
} as const;

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  /** Boîte de réception de l'agence : toutes les demandes de visite (vente et location), plus récentes d'abord. */
  async listAllVisitRequests(status?: VisitRequestStatus) {
    return this.prisma.propertyVisitRequest.findMany({
      where: status ? { status } : {},
      include: {
        property: { select: { id: true, name: true, commune: true, forSale: true, rentListed: true, isDemo: true } },
        user: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

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

    const landTitleType = dto.forSale ? dto.landTitleType ?? property.landTitleType : null;
    // Une vérification ne vaut que pour le titre contrôlé : propriétaire qui modifie, retrait ou autre type de titre = à revérifier.
    const resetVerification = user.role === UserRole.OWNER || landTitleType !== property.landTitleType;

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        forSale: dto.forSale,
        salePrice: dto.forSale ? dto.salePrice : null,
        saleCommissionRate: dto.forSale ? dto.saleCommissionRate : null,
        saleStatus: SaleStatus.DISPONIBLE,
        landTitleType,
        ...(resetVerification ? LAND_TITLE_NOT_VERIFIED : {}),
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

  /** P1-09 : l'agence ne certifie un titre qu'avec la copie du document foncier archivée ; date, vérificateur et pièce sont gardés. */
  async verifyLandTitle(propertyId: string, verified: boolean, user: AuthenticatedUser) {
    const property = await this.getProperty(propertyId);

    if (!verified) {
      const updated = await this.prisma.property.update({ where: { id: propertyId }, data: LAND_TITLE_NOT_VERIFIED });
      await this.audit.log({ userId: user.id, action: "UNVERIFY_LAND_TITLE", entityType: "Property", entityId: propertyId });
      return updated;
    }

    if (!property.forSale || !property.landTitleType) {
      throw new BadRequestException("Mettez d'abord le bien en vente en précisant le type de titre foncier.");
    }
    const document = await this.prisma.propertySaleDocument.findFirst({
      where: { propertyId, type: SaleDocumentType.DOCUMENT_FONCIER },
      orderBy: { createdAt: "desc" },
    });
    if (!document) {
      throw new BadRequestException("Archivez d'abord la copie du document foncier (type « Document foncier ») avant de marquer le titre comme vérifié.");
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { landTitleVerified: true, landTitleVerifiedAt: new Date(), landTitleVerifiedBy: user.fullName, landTitleDocumentId: document.id },
    });
    await this.audit.log({
      userId: user.id,
      action: "VERIFY_LAND_TITLE",
      entityType: "Property",
      entityId: propertyId,
      metadata: { documentId: document.id, landTitleType: property.landTitleType },
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

  // --- Demandes de visite (RDV) ---

  /** Accessible connecté ou en invité (visiteur du catalogue sans compte). */
  async createVisitRequest(propertyId: string, dto: CreateVisitRequestDto, user?: AuthenticatedUser) {
    const property = await this.getProperty(propertyId);
    const saleOpen = property.forSale && property.saleStatus !== SaleStatus.VENDU;
    const rentalOpen = property.rentListed && property.status === PropertyStatus.VACANT;
    if (property.archivedAt || (!saleOpen && !rentalOpen)) {
      throw new BadRequestException("Ce bien n'est plus disponible.");
    }
    if (property.isDemo) {
      throw new BadRequestException("Annonce de démonstration : ce bien est fictif, aucune visite n'est possible.");
    }
    if (!user && !dto.guestName) {
      throw new BadRequestException("Votre nom est requis pour envoyer une demande.");
    }
    if (!user && !dto.guestPhone) {
      throw new BadRequestException("Un numéro de téléphone est requis pour envoyer une demande.");
    }

    const request = await this.prisma.propertyVisitRequest.create({
      data: {
        reference: generateReference("RDV"),
        propertyId,
        userId: user?.id,
        guestName: user ? undefined : dto.guestName,
        guestPhone: user ? undefined : dto.guestPhone,
        guestEmail: user ? undefined : dto.guestEmail,
        message: dto.message,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
      },
    });

    await this.prisma.property.update({ where: { id: propertyId }, data: { inquiryCount: { increment: 1 } } });

    await this.notifications.notifyStaff({
      type: "VISIT_REQUEST",
      title: "Nouvelle demande de visite",
      message: `${user?.fullName ?? dto.guestName} (${dto.guestPhone ?? user?.email ?? "-"}) souhaite visiter « ${property.name} » (${saleOpen ? "vente" : "location"}), réf. ${request.reference}.`,
    });

    await this.audit.log({
      userId: user?.id,
      action: "CREATE_VISIT_REQUEST",
      entityType: "PropertyVisitRequest",
      entityId: request.id,
      metadata: { propertyId, guest: !user },
    });

    return request;
  }

  async listVisitRequests(propertyId: string, user: AuthenticatedUser) {
    const property = await this.getProperty(propertyId);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, property.ownerId);
    return this.prisma.propertyVisitRequest.findMany({
      where: { propertyId },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listMyVisitRequests(userId: string) {
    return this.prisma.propertyVisitRequest.findMany({
      where: { userId },
      include: { property: { select: { id: true, name: true, commune: true, address: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  private async getVisitRequest(id: string) {
    const request = await this.prisma.propertyVisitRequest.findUnique({ where: { id }, include: { property: true } });
    if (!request) throw new NotFoundException("Demande de visite introuvable.");
    return request;
  }

  async decideVisitRequest(id: string, status: VisitRequestStatus, dto: ScheduleVisitDto, user: AuthenticatedUser, actorId?: string) {
    const request = await this.getVisitRequest(id);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, request.property.ownerId);

    const updated = await this.prisma.propertyVisitRequest.update({
      where: { id },
      data: {
        status,
        scheduledDate: status === VisitRequestStatus.CONFIRME && dto.scheduledDate ? new Date(dto.scheduledDate) : request.scheduledDate,
      },
    });

    await this.audit.log({ userId: actorId, action: "DECIDE_VISIT_REQUEST", entityType: "PropertyVisitRequest", entityId: id, metadata: { status } });
    return updated;
  }

  // --- Documents de vente (mutation, contrat, reçu, preuve, acte...) ---

  async listSaleDocuments(propertyId: string, user: AuthenticatedUser) {
    const property = await this.getProperty(propertyId);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, property.ownerId);
    return this.prisma.propertySaleDocument.findMany({ where: { propertyId }, orderBy: { createdAt: "desc" } });
  }

  async addSaleDocument(propertyId: string, dto: UploadSaleDocumentDto, url: string, actorId?: string) {
    await this.getProperty(propertyId);
    const document = await this.prisma.propertySaleDocument.create({
      data: { propertyId, type: dto.type, label: dto.label, url },
    });
    await this.audit.log({ userId: actorId, action: "ADD_SALE_DOCUMENT", entityType: "PropertySaleDocument", entityId: document.id, metadata: { propertyId, type: dto.type } });
    return document;
  }

  async removeSaleDocument(documentId: string, actorId?: string) {
    const document = await this.prisma.propertySaleDocument.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException("Document introuvable.");
    // Sans la pièce qui la justifie, la vérification du titre tombe (l'annonce quitte le catalogue).
    const [unverified] = await this.prisma.$transaction([
      this.prisma.property.updateMany({ where: { landTitleDocumentId: documentId }, data: LAND_TITLE_NOT_VERIFIED }),
      this.prisma.propertySaleDocument.delete({ where: { id: documentId } }),
    ]);
    await this.audit.log({ userId: actorId, action: "REMOVE_SALE_DOCUMENT", entityType: "PropertySaleDocument", entityId: documentId });
    if (unverified.count > 0) {
      await this.audit.log({ userId: actorId, action: "LAND_TITLE_VERIFICATION_REMOVED", entityType: "Property", entityId: document.propertyId, metadata: { documentId } });
    }
    return { success: true };
  }
}
