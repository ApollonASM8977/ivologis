import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsappPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  rccmNumber?: string;

  /** Numéro de compte contribuable (NCC). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  taxNumber?: string;

  /** Numéro d'agrément d'agent immobilier délivré par le ministère. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  agentLicenseNumber?: string;

  /** Numéro d'autorisation de traitement de données délivré par l'ARTCI. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  artciNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  publicationDirector?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: "Le taux de commission ne peut pas être négatif." })
  @Max(50, { message: "Le taux de commission ne peut pas dépasser 50 %." })
  commissionRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledPaymentMethods?: string[];

  @IsOptional()
  @IsString()
  language?: string;
}
