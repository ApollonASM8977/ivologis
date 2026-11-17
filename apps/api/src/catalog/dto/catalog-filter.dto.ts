import { PropertyType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export const CATALOG_SORTS = ["recent", "price_asc", "price_desc"] as const;

/** Filtres du catalogue public, tous facultatifs et transmis dans l'URL. */
export class CatalogFilterDto {
  /** Commune d'Abidjan ou ville (Grand-Bassam, Bouaké…). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  zone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  neighborhood?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  minRooms?: number;

  // « false » ne doit pas devenir true (Boolean("false") === true).
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsIn(CATALOG_SORTS)
  sort?: (typeof CATALOG_SORTS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
