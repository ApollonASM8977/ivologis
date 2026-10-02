import { Body, Controller, Get, Header, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PERMISSION_KEYS } from "@ivologis/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { assertOwnsResource, assertOwnsTenantResource } from "../common/utils/scope.util";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentFilterDto } from "./dto/payment-filter.dto";

function scopeFor(user: AuthenticatedUser) {
  if (user.role === UserRole.OWNER) return { ownerId: user.ownerId! };
  if (user.role === UserRole.TENANT) return { tenantId: user.tenantId! };
  return {};
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get("overdue")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  findOverdue(@CurrentUser() user: AuthenticatedUser) {
    const scope = user.role === UserRole.OWNER ? { ownerId: user.ownerId! } : {};
    return this.paymentsService.findOverdue(scope);
  }

  @Get("export")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER)
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="paiements.csv"')
  exportCsv(@Query() filter: PaymentFilterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.exportCsv(filter, scopeFor(user));
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.OWNER, UserRole.TENANT)
  findAll(@Query() filter: PaymentFilterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.findAll(filter, scopeFor(user));
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PAYMENTS_MANAGE)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Post("simulate")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT, UserRole.TENANT)
  simulate(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthenticatedUser) {
    const payload = user.role === UserRole.TENANT ? { ...dto, tenantId: user.tenantId! } : dto;
    return this.paymentsService.simulateMobileMoneyPayment(payload);
  }

  @Post(":id/confirm")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PAYMENTS_MANAGE)
  confirm(@Param("id") id: string) {
    return this.paymentsService.confirmPayment(id);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const payment = await this.paymentsService.findOne(id);
    if (user.role === UserRole.OWNER) assertOwnsResource(user, payment.ownerId);
    if (user.role === UserRole.TENANT) assertOwnsTenantResource(user, payment.tenantId);
    return payment;
  }

  @Post(":id/receipt")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @RequirePermissions(PERMISSION_KEYS.PAYMENTS_MANAGE)
  generateReceipt(@Param("id") id: string) {
    return this.paymentsService.generateReceipt(id);
  }
}
