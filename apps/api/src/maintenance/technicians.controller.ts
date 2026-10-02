import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { IsOptional, IsString, MinLength } from "class-validator";

class CreateTechnicianDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsOptional()
  @IsString()
  specialty?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
@Controller("technicians")
export class TechniciansController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.technician.findMany({ orderBy: { fullName: "asc" } });
  }

  @Post()
  create(@Body() dto: CreateTechnicianDto) {
    return this.prisma.technician.create({ data: dto });
  }
}
