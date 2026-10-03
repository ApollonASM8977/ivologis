import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { AuditService } from "./audit.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("audit-logs")
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.auditService.findAll(pagination);
  }
}
