import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { AnalyticsService } from "./analytics.service";
import { PageViewDto } from "./dto/page-view.dto";

@Controller("analytics")
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  /** Public, sans compte : une page vue anonyme. Limité pour qu'un robot ne gonfle pas les chiffres. */
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post("pageview")
  @HttpCode(204)
  async pageView(@Body() dto: PageViewDto) {
    await this.analytics.record(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @Get("summary")
  summary(@Query("days") days?: string) {
    const n = Math.min(365, Math.max(1, Number(days) || 30));
    return this.analytics.summary(n);
  }
}
