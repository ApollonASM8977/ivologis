import { MaintenanceIssueType, MaintenancePriority } from "@prisma/client";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateMaintenanceDto {
  @IsUUID()
  propertyId: string;

  @IsEnum(MaintenanceIssueType)
  issueType: MaintenanceIssueType;

  @IsString()
  @MinLength(5)
  description: string;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
