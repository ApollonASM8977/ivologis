import { Controller, ForbiddenException, Get, Param, UseGuards } from "@nestjs/common";
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
import { PrismaService } from "../prisma/prisma.service";
import { ReportsService } from "./reports.service";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("reports")
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private prisma: PrismaService,
  ) {}

  @Get("dashboard")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  dashboard(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER) {
      return this.reportsService.ownerDashboard(user.ownerId!);
    }
    return this.reportsService.globalDashboard();
  }

  @Get("financial")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.REPORTS_VIEW)
  globalFinancial() {
    return this.reportsService.globalFinancialReport();
  }

  @Get("owner/:id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  ownerReport(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER && user.ownerId !== id) {
      throw new ForbiddenException("Vous n'avez pas accès à ce relevé.");
    }
    return this.reportsService.ownerFinancialReport(id);
  }

  @Get("property/:id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  async propertyReport(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.OWNER) {
      const property = await this.prisma.property.findUnique({ where: { id } });
      if (!property) throw new ForbiddenException("Bien introuvable.");
      assertOwnsResource(user, property.ownerId);
    }
    return this.reportsService.propertyReport(id);
  }
}
