import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, Max, Min } from "class-validator";

export class SetSaleDto {
  @IsBoolean()
  forSale: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000_000)
  salePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  saleCommissionRate?: number;
}
