import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

export class CreatePaymentDto {
  /** Optionnel côté requête : un locataire qui s'auto-paie ne l'envoie pas,
   * le contrôleur le complète alors avec son propre tenantId (voir PaymentsController). */
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  leaseId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  periodMonth: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
