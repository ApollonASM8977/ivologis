import { IsInt, IsOptional, Max, Min } from "class-validator";

/** null = décision à prendre, 0 = ne pas reconduire, N = reconduction tacite de N mois. */
export class ExpiryDecisionDto {
  @IsOptional()
  @IsInt({ message: "La durée de reconduction doit être un nombre entier de mois." })
  @Min(0, { message: "La durée de reconduction ne peut pas être négative." })
  @Max(120, { message: "La durée de reconduction ne peut pas dépasser 120 mois." })
  autoRenewMonths?: number | null;
}
