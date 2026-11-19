import { LandTitleType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, Max, Min } from "class-validator";

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

  @IsOptional()
  @IsEnum(LandTitleType)
  landTitleType?: LandTitleType;
}

/** P1-09 : la vérification du titre passe par sa propre route, réservée à l'agence. */
export class VerifyLandTitleDto {
  @IsBoolean()
  verified: boolean;
}
