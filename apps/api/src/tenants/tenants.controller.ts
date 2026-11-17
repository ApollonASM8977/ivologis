import {
  BadRequestException,
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
import { assertOwnsTenantResource } from "../common/utils/scope.util";
import { hideTenantPrivate } from "../common/interceptors/agency-privacy.interceptor";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("tenants")
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get("me")
  @Roles(UserRole.TENANT)
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.findByUserId(user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: AuthenticatedUser) {
    // Un propriétaire voit toujours ses propres locataires (liste filtrée) ; la permission ne concerne que les agents.
    if (user.role === UserRole.ADMIN_AGENT && !user.permissions.includes(PERMISSION_KEYS.TENANTS_MANAGE)) {
      throw new ForbiddenException("Vous n'avez pas la permission requise pour cette action.");
    }
    if (user.role !== UserRole.OWNER) return this.tenantsService.findAll(pagination);
    // Tout passe par l'agence : le propriétaire voit qui occupe son bien, pas comment le joindre.
    const page = await this.tenantsService.findAll(pagination, user.ownerId!);
    return { ...page, data: hideTenantPrivate(page.data) };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.TENANTS_MANAGE)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Post("import")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.TENANTS_MANAGE)
  importRows(@Body("rows") rows: unknown[]) {
    if (!Array.isArray(rows) || rows.length === 0 || rows.length > 200) {
      throw new BadRequestException("Importez entre 1 et 200 locataires à la fois.");
    }
    return this.tenantsService.importRows(rows);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.TENANT) {
      assertOwnsTenantResource(user, id);
    }
    if (user.role === UserRole.OWNER) {
      const allowed = await this.tenantsService.belongsToOwner(id, user.ownerId!);
      if (!allowed) throw new ForbiddenException("Vous n'avez pas accès à ce locataire.");
      return hideTenantPrivate(await this.tenantsService.findOne(id));
    }
    return this.tenantsService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.TENANT)
  update(@Param("id") id: string, @Body() dto: UpdateTenantDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.TENANT) {
      assertOwnsTenantResource(user, id);
    } else if (!user.permissions.includes(PERMISSION_KEYS.TENANTS_MANAGE) && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Vous n'avez pas la permission requise pour cette action.");
    }
    return this.tenantsService.update(id, dto);
  }

  @Patch(":id/status")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.TENANTS_MANAGE)
  updateStatus(@Param("id") id: string, @Body("status") status: AccountStatus) {
    return this.tenantsService.updateStatus(id, status);
  }

  @Post(":id/invite")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.TENANTS_MANAGE)
  createInvite(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.createInvite(id, user.id);
  }
}
