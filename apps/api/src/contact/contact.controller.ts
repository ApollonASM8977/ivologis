import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";

@Controller("contact-requests")
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.contactService.findAll(pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id")
  markHandled(@Param("id") id: string, @Body("handled") handled: boolean) {
    return this.contactService.markHandled(id, handled);
  }
}
