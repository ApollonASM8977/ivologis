import { MaintenancePriority, MaintenanceStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

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
  @MaxLength(2000, { message: "Le message est trop long (2 000 caractères maximum)." })
  comment: string;
}
