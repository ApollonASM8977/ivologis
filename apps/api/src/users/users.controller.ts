import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AccountStatus, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { UsersService } from "./users.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateProfileDto, UpdatePermissionsDto } from "./dto/update-profile.dto";
import { imageUploadOptions } from "../common/image-upload/image-upload.options";
import { StorageService } from "../storage/storage.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private storage: StorageService,
  ) {}

  @Patch("me")
  updateOwnProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post("me/avatar")
  @UseInterceptors(FileInterceptor("file", imageUploadOptions(3)))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    if (!file) throw new BadRequestException("Aucune image reçue.");
    const url = await this.storage.save({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
    });
    return this.usersService.updateAvatar(user.id, url);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  listAll() {
    return this.usersService.listAll();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get("admins")
  listAdmins() {
    return this.usersService.listAdmins();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post("admins")
  createAdmin(@Body() dto: CreateAdminDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.createAdmin(dto, actor.id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get("permissions")
  listPermissions() {
    return this.usersService.listPermissions();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body("status") status: AccountStatus,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, status, actor.id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id/permissions")
  updatePermissions(
    @Param("id") id: string,
    @Body() dto: UpdatePermissionsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.updatePermissions(id, dto.permissions, actor.id);
  }
}
