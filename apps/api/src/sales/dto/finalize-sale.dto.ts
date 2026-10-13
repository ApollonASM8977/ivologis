import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class FinalizeSaleDto {
  @IsString()
  @MaxLength(120)
  buyerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  buyerPhone?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000_000)
  finalPrice: number;

  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
