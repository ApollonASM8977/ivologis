import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AccountStatus, UserRole } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PaginationDto } from "../common/dto/pagination.dto";
import { assertOwnsResource } from "../common/utils/scope.util";
import { OwnersService } from "./owners.service";
import { CreateOwnerDto } from "./dto/create-owner.dto";
import { UpdateOwnerDto } from "./dto/update-owner.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("owners")
export class OwnersController {
  constructor(private ownersService: OwnersService) {}

  @Get("me")
  @Roles(UserRole.OWNER)
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.ownersService.findByUserId(user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.OWNERS_MANAGE)
  findAll(@Query() pagination: PaginationDto) {
    return this.ownersService.findAll(pagination);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.OWNERS_MANAGE)
  create(@Body() dto: CreateOwnerDto) {
    return this.ownersService.create(dto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER) {
      assertOwnsResource(user, id);
    }
    return this.ownersService.findOne(id);
  }

  @Get(":id/revenue-summary")
  async revenueSummary(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER) {
      assertOwnsResource(user, id);
    }
    return this.ownersService.revenueSummary(id);
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateOwnerDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER) {
      assertOwnsResource(user, id);
    } else if (!user.permissions.includes(PERMISSION_KEYS.OWNERS_MANAGE) && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Vous n'avez pas la permission requise pour cette action.");
    }
    return this.ownersService.update(id, dto);
  }

  @Patch(":id/status")
  @Roles(UserRole.SUPER_ADMIN)
  updateStatus(@Param("id") id: string, @Body("status") status: AccountStatus) {
    return this.ownersService.updateStatus(id, status);
  }
}
