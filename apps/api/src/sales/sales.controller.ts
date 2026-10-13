import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Delete, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SaleOfferStatus, UserRole, VisitRequestStatus } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { documentUploadOptions } from "../common/file-upload/document-upload.options";
import { StorageService } from "../storage/storage.service";
import { SalesService } from "./sales.service";
import { SetSaleDto } from "./dto/set-sale.dto";
import { CreateSaleOfferDto } from "./dto/create-offer.dto";
import { FinalizeSaleDto } from "./dto/finalize-sale.dto";
import { CreateVisitRequestDto } from "./dto/create-visit-request.dto";
import { ScheduleVisitDto } from "./dto/schedule-visit.dto";
import { UploadSaleDocumentDto } from "./dto/upload-sale-document.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller()
export class SalesController {
  constructor(
    private salesService: SalesService,
    private storage: StorageService,
  ) {}

  @Get("sales")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  listForSale(@CurrentUser() user: AuthenticatedUser) {
    return this.salesService.listForSale(user);
  }

  @Patch("properties/:propertyId/sale")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  setSale(@Param("propertyId") propertyId: string, @Body() dto: SetSaleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.setSale(propertyId, dto, user, user.id);
  }

  @Get("properties/:propertyId/sale-offers")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  listOffers(@Param("propertyId") propertyId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.listOffers(propertyId, user);
  }

  @Post("properties/:propertyId/sale-offers")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  addOffer(@Param("propertyId") propertyId: string, @Body() dto: CreateSaleOfferDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.addOffer(propertyId, dto, user.id);
  }

  @Patch("sale-offers/:offerId/accept")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  acceptOffer(@Param("offerId") offerId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.updateOfferStatus(offerId, SaleOfferStatus.ACCEPTEE, user.id);
  }

  @Patch("sale-offers/:offerId/refuse")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  refuseOffer(@Param("offerId") offerId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.updateOfferStatus(offerId, SaleOfferStatus.REFUSEE, user.id);
  }

  @Post("properties/:propertyId/sale-document")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  @UseInterceptors(FileInterceptor("file", documentUploadOptions(10)))
  async uploadSaleDocument(@Param("propertyId") propertyId: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    if (!file) throw new BadRequestException("Aucun document reçu.");
    const url = await this.storage.save({ buffer: file.buffer, filename: file.originalname, mimeType: file.mimetype });
    return this.salesService.setSaleDocument(propertyId, url, user.id);
  }

  @Post("properties/:propertyId/finalize-sale")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  finalize(@Param("propertyId") propertyId: string, @Body() dto: FinalizeSaleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.finalize(propertyId, dto, user.id);
  }

  // --- Demandes de visite ---

  @Post("properties/:propertyId/visit-requests")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  requestVisit(@Param("propertyId") propertyId: string, @Body() dto: CreateVisitRequestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.createVisitRequest(propertyId, dto, user.id);
  }

  @Get("properties/:propertyId/visit-requests")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  listVisitRequests(@Param("propertyId") propertyId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.listVisitRequests(propertyId, user);
  }

  @Get("visit-requests/mine")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  listMyVisitRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.salesService.listMyVisitRequests(user.id);
  }

  @Patch("visit-requests/:id/confirm")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  confirmVisit(@Param("id") id: string, @Body() dto: ScheduleVisitDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.decideVisitRequest(id, VisitRequestStatus.CONFIRME, dto, user, user.id);
  }

  @Patch("visit-requests/:id/refuse")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  refuseVisit(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.decideVisitRequest(id, VisitRequestStatus.REFUSE, {}, user, user.id);
  }

  // --- Documents de vente (mutation, contrat, reçu, preuve, acte...) ---

  @Get("properties/:propertyId/sale-documents")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  listSaleDocuments(@Param("propertyId") propertyId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.listSaleDocuments(propertyId, user);
  }

  @Post("properties/:propertyId/sale-documents")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  @UseInterceptors(FileInterceptor("file", documentUploadOptions(10)))
  async addSaleDocument(
    @Param("propertyId") propertyId: string,
    @Body() dto: UploadSaleDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException("Aucun document reçu.");
    const url = await this.storage.save({ buffer: file.buffer, filename: file.originalname, mimeType: file.mimetype });
    return this.salesService.addSaleDocument(propertyId, dto, url, user.id);
  }

  @Delete("sale-documents/:documentId")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  removeSaleDocument(@Param("documentId") documentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.removeSaleDocument(documentId, user.id);
  }
}
