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

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("leases")
export class LeasesController {
  constructor(private leasesService: LeasesService) {}

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
  renew(@Param("id") id: string, @Body() dto: RenewLeaseDto) {
    return this.leasesService.renew(id, dto);
  }

  @Post(":id/terminate")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.LEASES_MANAGE)
  terminate(@Param("id") id: string) {
    return this.leasesService.terminate(id);
  }
}
