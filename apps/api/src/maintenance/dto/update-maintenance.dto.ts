import { MaintenancePriority, MaintenanceStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  finalCost?: number;

  @IsOptional()
  @IsString()
  adminComment?: string;
}

export class AddCommentDto {
  @IsString()
  comment: string;
}
