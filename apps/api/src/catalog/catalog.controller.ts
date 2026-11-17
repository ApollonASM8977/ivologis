import { Controller, Get, Param } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

/**
 * Catalogue public (aucune connexion requise) : biens en vente et biens en
 * courte durée, tous propriétaires confondus. Lecture seule — la gestion
 * reste dans les modules sales/short-stay.
 */
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

  @Get("rentals")
  listRentals() {
    return this.catalogService.listRentals();
  }

  @Get("rentals/:id")
  getRentalDetail(@Param("id") id: string) {
    return this.catalogService.getRentalDetail(id);
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
