import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { SearchService } from "./search.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("search")
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @Get()
  search(@Query("q") q = "") {
    return this.searchService.search(q.slice(0, 80));
  }
}
