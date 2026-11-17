import { PaymentMethod } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length, MaxLength } from "class-validator";

/** Déclaration d'un loyer payé par le locataire : l'agence vérifie la transaction avant toute quittance. */
export class PayRentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  @Length(4, 60)
  transactionRef: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
