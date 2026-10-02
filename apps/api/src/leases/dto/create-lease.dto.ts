import { LeaseType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from "class-validator";

/**
 * Champs libres selon le type de bail, remplis dynamiquement côté UI puis
 * injectés tels quels dans le document généré (PDF/Word) :
 * - HABITATION_NUE / HABITATION_MEUBLEE : furnitureInventory, occupantsCount,
 *   guarantorName, guarantorPhone, guarantorAddress, noticePeriodMonths
 * - COMMERCIAL : businessActivity, tradeName, pasDePorte, renewalTacite
 * - PROFESSIONNEL : profession, professionalOrder
 * - TERRAIN : landUse, constructionPermitRequired, titleReference
 */
export class CreateLeaseDto {
  @IsEnum(LeaseType)
  type: LeaseType;

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

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}
