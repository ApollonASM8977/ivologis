import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateLeaseDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  tenantId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deposit: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advance: number;

  @IsOptional()
  @IsString()
  specialConditions?: string;
}
