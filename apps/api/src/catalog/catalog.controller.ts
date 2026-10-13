import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CatalogService } from "./catalog.service";

/**
 * Catalogue consultable par tout utilisateur connecté (admin, agent,
 * propriétaire ou locataire) : biens en vente et biens en courte durée,
 * tous propriétaires confondus. Lecture seule — la gestion reste dans les
 * modules sales/short-stay.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
@Controller("catalog")
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get("sales")
  listSales() {
    return this.catalogService.listSales();
  }

  @Get("sales/:id")
  getSaleDetail(@Param("id") id: string) {
    return this.catalogService.getSaleDetail(id);
  }

  @Get("short-stay")
  listShortStay() {
    return this.catalogService.listShortStay();
  }

  @Get("short-stay/:id")
  getShortStayDetail(@Param("id") id: string) {
    return this.catalogService.getShortStayDetail(id);
  }
}
