import { Controller, ForbiddenException, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
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
import { ownerStatementCsv, ownerStatementPdf } from "./owner-statement.renderer";

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

  @Get("owner/:id/export")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  async exportOwnerStatement(
    @Param("id") id: string,
    @Query("format") format: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    if (user.role === UserRole.OWNER && user.ownerId !== id) {
      throw new ForbiddenException("Vous n'avez pas accès à ce relevé.");
    }
    const statement = await this.reportsService.ownerStatement(id);
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="releve-financier-${stamp}.csv"`);
      return res.send(ownerStatementCsv(statement));
    }

    const pdf = await ownerStatementPdf(statement);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="releve-financier-${stamp}.pdf"`);
    return res.send(pdf);
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
