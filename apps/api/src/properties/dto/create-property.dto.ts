import { PropertyType } from "@prisma/client";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export class CreatePropertyDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address: string;

  @IsString()
  commune: string;

  /** Quartier (Riviera 3, Angré 8e Tranche, Zone 4…) : distinct de la commune. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surfaceM2?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearBuilt?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  landmark?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deposit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advance?: number;

  /** Requis uniquement quand un admin/agent crée le bien pour un propriétaire. */
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  shortStayEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shortStayNightlyRate?: number;

  /** Lien d'intégration (Matterport, Kuula...) vers une visite virtuelle 360°, facultatif. */
  // Intégrée en iframe sur la page publique : https uniquement.
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true }, { message: "Le lien de visite virtuelle doit commencer par https://." })
  virtualTourUrl?: string;

  /** Ignoré pour un propriétaire : seule l'agence valide la publication. */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  shortStayApproved?: boolean;

  /** Ignoré pour un propriétaire : seule l'agence publie un bien à louer au catalogue. */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rentListed?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDemo?: boolean;
}
