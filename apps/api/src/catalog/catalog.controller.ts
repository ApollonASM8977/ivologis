import { Controller, Get, Headers, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { CatalogFilterDto } from "./dto/catalog-filter.dto";

// Le rendu serveur du site (référencement) envoie cet en-tête : sa lecture ne compte pas comme une visite.
const NO_COUNT_HEADER = "x-ivologis-no-count";

/**
 * Catalogue public (aucune connexion requise) : locations, ventes et courte durée publiées par l'agence.
 * Lecture seule — la gestion reste dans les modules properties/sales/short-stay.
 */
@Controller("catalog")
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get("sales")
  listSales(@Query() filter: CatalogFilterDto) {
    return this.catalogService.listSales(filter);
  }

  @Get("sales/:id")
  getSaleDetail(@Param("id") id: string, @Headers(NO_COUNT_HEADER) noCount?: string) {
    return this.catalogService.getSaleDetail(id, !noCount);
  }

  @Get("rentals")
  listRentals(@Query() filter: CatalogFilterDto) {
    return this.catalogService.listRentals(filter);
  }

  @Get("rentals/:id")
  getRentalDetail(@Param("id") id: string, @Headers(NO_COUNT_HEADER) noCount?: string) {
    return this.catalogService.getRentalDetail(id, !noCount);
  }

  @Get("short-stay")
  listShortStay(@Query() filter: CatalogFilterDto) {
    return this.catalogService.listShortStay(filter);
  }

  @Get("short-stay/:id")
  getShortStayDetail(@Param("id") id: string, @Headers(NO_COUNT_HEADER) noCount?: string) {
    return this.catalogService.getShortStayDetail(id, !noCount);
  }
}
