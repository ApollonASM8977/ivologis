import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateShortStayBookingDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  @MaxLength(120)
  guestName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  guestPhone?: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100_000_000)
  nightlyRate: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100_000_000)
  depositAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
