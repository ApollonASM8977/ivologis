import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { TenantRequestStatus, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { documentUploadOptions } from "../common/file-upload/document-upload.options";
import { StorageService } from "../storage/storage.service";
import { TenantRequestsService } from "./tenant-requests.service";
import { CreateTenantRequestDto } from "./dto/create-tenant-request.dto";
import { DecideTenantRequestDto } from "./dto/decide-tenant-request.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("tenant-requests")
export class TenantRequestsController {
  constructor(
    private requests: TenantRequestsService,
    private storage: StorageService,
  ) {}

  @Roles(UserRole.TENANT)
  @Post()
  create(@Body() dto: CreateTenantRequestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.requests.create(user.tenantId!, dto);
  }

  @Roles(UserRole.TENANT)
  @Post("attachment")
  @UseInterceptors(FileInterceptor("file", documentUploadOptions(5)))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Aucun fichier reçu.");
    const url = await this.storage.save({ buffer: file.buffer, filename: file.originalname, mimeType: file.mimetype });
    return { url };
  }

  @Roles(UserRole.TENANT, UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query("status") status?: TenantRequestStatus) {
    if (user.role === UserRole.TENANT) return this.requests.listForTenant(user.tenantId!);
    return this.requests.listAll(status);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @Patch(":id")
  decide(@Param("id") id: string, @Body() dto: DecideTenantRequestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.requests.decide(id, dto, user.id);
  }
}
