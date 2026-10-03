import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRole } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { assertOwnsResource } from "../common/utils/scope.util";
import { imageUploadOptions } from "../common/image-upload/image-upload.options";
import { StorageService } from "../storage/storage.service";
import { PropertiesService } from "./properties.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyFilterDto } from "./dto/property-filter.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("properties")
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private storage: StorageService,
  ) {}

  @Get("me")
  @Roles(UserRole.TENANT)
  findMyProperty(@CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.findForTenant(user.tenantId!);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  findAll(@Query() filter: PropertyFilterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.findAll(filter, user);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.create(dto, user);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const property = await this.propertiesService.findOne(id);
    if (user.role === UserRole.OWNER) {
      assertOwnsResource(user, property.ownerId);
    }
    if (user.role === UserRole.TENANT && property.currentTenantId !== user.tenantId) {
      throw new ForbiddenException("Vous n'avez pas accès à ce bien.");
    }
    return property;
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role === UserRole.OWNER) {
      const property = await this.propertiesService.findOne(id);
      assertOwnsResource(user, property.ownerId);
    }
    return this.propertiesService.update(id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  async archive(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER) {
      const property = await this.propertiesService.findOne(id);
      assertOwnsResource(user, property.ownerId);
    }
    return this.propertiesService.archive(id, user.id);
  }

  @Post(":id/images")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  @UseInterceptors(
    FileInterceptor("file", imageUploadOptions(5)),
  )
  async uploadImage(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("isCover") isCover: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException("Aucune image reçue.");
    if (user.role === UserRole.OWNER) {
      const property = await this.propertiesService.findOne(id);
      assertOwnsResource(user, property.ownerId);
    }
    const url = await this.storage.save({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
    });
    return this.propertiesService.addImage(id, url, isCover === "true");
  }

  @Delete("images/:imageId")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  async removeImage(@Param("imageId") imageId: string, @CurrentUser() user: AuthenticatedUser) {
    const image = await this.propertiesService.findImage(imageId);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, image.property.ownerId);
    return this.propertiesService.removeImage(imageId);
  }
}
