import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PaginationDto } from "../common/dto/pagination.dto";
import { assertOwnsResource, assertOwnsTenantResource } from "../common/utils/scope.util";
import { LeasesService } from "./leases.service";
import { CreateLeaseDto } from "./dto/create-lease.dto";
import { RenewLeaseDto } from "./dto/renew-lease.dto";
import { UpdateLeaseDto } from "./dto/update-lease.dto";
import { CreateInspectionDto } from "./dto/create-inspection.dto";
import { DepositSettlementDto } from "./dto/deposit-settlement.dto";
import { RentRevisionDto } from "./dto/revision.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { BadRequestException, UploadedFile, UseInterceptors } from "@nestjs/common";
import { imageUploadOptions } from "../common/image-upload/image-upload.options";
import { StorageService } from "../storage/storage.service";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("leases")
export class LeasesController {
  constructor(
    private leasesService: LeasesService,
    private storage: StorageService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  findAll(@Query() pagination: PaginationDto, @CurrentUser() user: AuthenticatedUser) {
    const scope =
      user.role === UserRole.OWNER
        ? { ownerId: user.ownerId! }
        : user.role === UserRole.TENANT
          ? { tenantId: user.tenantId! }
          : {};
    return this.leasesService.findAll(pagination, scope);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  create(@Body() dto: CreateLeaseDto) {
    return this.leasesService.create(dto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const lease = await this.leasesService.findOne(id);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, lease.ownerId);
    if (user.role === UserRole.TENANT) assertOwnsTenantResource(user, lease.tenantId);
    return lease;
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  update(@Param("id") id: string, @Body() dto: UpdateLeaseDto) {
    return this.leasesService.update(id, dto);
  }

  @Post(":id/document")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  generateDocument(@Param("id") id: string, @Query("format") format?: "pdf" | "docx") {
    return this.leasesService.generateContractDocument(id, format === "docx" ? "docx" : "pdf");
  }

  @Post(":id/renew")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  renew(@Param("id") id: string, @Body() dto: RenewLeaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leasesService.renew(id, dto, user.id);
  }

  @Post(":id/terminate")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  terminate(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.leasesService.terminate(id, user.id);
  }

  @Get("revisions/due")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  dueRevisions() {
    return this.leasesService.dueRevisions();
  }

  @Get(":id/inspections")
  async listInspections(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.scopeLease(id, user);
    return this.leasesService.listInspections(id);
  }

  @Get(":id/inspections/compare")
  async compareInspections(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.scopeLease(id, user);
    return this.leasesService.compareInspections(id);
  }

  @Post(":id/inspections")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  addInspection(@Param("id") id: string, @Body() dto: CreateInspectionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leasesService.addInspection(id, dto, user.id);
  }

  @Post(":id/inspections/photo")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  @UseInterceptors(FileInterceptor("file", imageUploadOptions(5)))
  async uploadInspectionPhoto(@Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    await this.leasesService.findOne(id);
    if (!file) throw new BadRequestException("Aucune photo reçue.");
    const url = await this.storage.save({ buffer: file.buffer, filename: file.originalname, mimeType: file.mimetype });
    return { url };
  }

  @Post(":id/deposit-settlement")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  settleDeposit(@Param("id") id: string, @Body() dto: DepositSettlementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leasesService.settleDeposit(id, dto, user.id);
  }

  @Post(":id/revision")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  reviseRent(@Param("id") id: string, @Body() dto: RentRevisionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leasesService.reviseRent(id, dto, user.id);
  }

  private async scopeLease(id: string, user: AuthenticatedUser) {
    const lease = await this.leasesService.findOne(id);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, lease.ownerId);
    if (user.role === UserRole.TENANT) assertOwnsTenantResource(user, lease.tenantId);
  }
}
