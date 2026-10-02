import {
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
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
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
import { PropertiesService } from "./properties.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyFilterDto } from "./dto/property-filter.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("properties")
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

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
    return this.propertiesService.archive(id);
  }

  @Post(":id/images")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? "./uploads",
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".webp"];
        cb(null, allowed.includes(extname(file.originalname).toLowerCase()));
      },
    }),
  )
  async uploadImage(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("isCover") isCover: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role === UserRole.OWNER) {
      const property = await this.propertiesService.findOne(id);
      assertOwnsResource(user, property.ownerId);
    }
    return this.propertiesService.addImage(id, `/uploads/${file.filename}`, isCover === "true");
  }

  @Delete("images/:imageId")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  removeImage(@Param("imageId") imageId: string) {
    return this.propertiesService.removeImage(imageId);
  }
}
