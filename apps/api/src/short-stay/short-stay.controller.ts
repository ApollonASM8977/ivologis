import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ShortStayService } from "./short-stay.service";
import { CreateShortStayBookingDto } from "./dto/create-booking.dto";
import { RequestShortStayBookingDto } from "./dto/request-booking.dto";
import { MarkPaidDto } from "./dto/mark-paid.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller()
export class ShortStayController {
  constructor(private shortStayService: ShortStayService) {}

  @Post("properties/:propertyId/short-stay-bookings")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  create(@Param("propertyId") propertyId: string, @Body() dto: CreateShortStayBookingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.create(propertyId, dto, user.id);
  }

  @Get("properties/:propertyId/short-stay-bookings")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  listByProperty(@Param("propertyId") propertyId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.listByProperty(propertyId, user);
  }

  @Get("short-stay-bookings/upcoming")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  listUpcoming(@CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.listUpcoming(user);
  }

  @Get("short-stay-bookings/mine")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.listMine(user.id);
  }

  @Post("properties/:propertyId/short-stay-bookings/request")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  requestBooking(@Param("propertyId") propertyId: string, @Body() dto: RequestShortStayBookingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.requestBooking(propertyId, dto, user);
  }

  @Patch("short-stay-bookings/:id/confirm")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  confirm(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.confirm(id, user, user.id);
  }

  @Patch("short-stay-bookings/:id/refuse")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  refuse(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.refuse(id, user, user.id);
  }

  @Patch("short-stay-bookings/:id/mark-paid")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  markPaid(@Param("id") id: string, @Body() dto: MarkPaidDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.markPaid(id, dto.isPaid, user.id);
  }

  @Patch("short-stay-bookings/:id/cancel")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  cancel(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.cancel(id, user.id);
  }

  @Patch("short-stay-bookings/:id/complete")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PROPERTIES_MANAGE)
  complete(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.shortStayService.complete(id, user.id);
  }
}
