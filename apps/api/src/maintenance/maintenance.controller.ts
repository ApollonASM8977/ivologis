import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MaintenanceStatus, UserRole } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PaginationDto } from "../common/dto/pagination.dto";
import { MaintenanceService } from "./maintenance.service";
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { AddCommentDto, UpdateMaintenanceDto } from "./dto/update-maintenance.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("maintenance")
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  findAll(
    @Query() pagination: PaginationDto,
    @Query("status") status: MaintenanceStatus | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const scope =
      user.role === UserRole.OWNER
        ? { ownerId: user.ownerId! }
        : user.role === UserRole.TENANT
          ? { tenantId: user.tenantId! }
          : {};
    return this.maintenanceService.findAll(pagination, scope, status);
  }

  @Post()
  @Roles(UserRole.TENANT)
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.maintenanceService.create(dto, user.tenantId!);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const request = await this.maintenanceService.findOne(id);
    this.assertCanAccess(request, user);
    return request;
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.MAINTENANCE_MANAGE)
  update(@Param("id") id: string, @Body() dto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, dto);
  }

  @Post(":id/comments")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  async addComment(
    @Param("id") id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const request = await this.maintenanceService.findOne(id);
    this.assertCanAccess(request, user);
    return this.maintenanceService.addComment(id, user.id, dto.comment);
  }

  private assertCanAccess(request: { tenantId: string; property: { ownerId: string } }, user: AuthenticatedUser) {
    if (user.role === UserRole.TENANT && request.tenantId !== user.tenantId) {
      throw new ForbiddenException("Vous n'avez pas accès à cette demande.");
    }
    if (user.role === UserRole.OWNER && request.property.ownerId !== user.ownerId) {
      throw new ForbiddenException("Vous n'avez pas accès à cette demande.");
    }
  }
}
