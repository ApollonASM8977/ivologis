import { Transform } from "class-transformer";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

/** Suivi d'une demande sans compte (P1-07) : la référence donnée à l'envoi + le téléphone saisi dans la demande. */
export class TrackRequestDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toUpperCase() : value))
  @IsString()
  @Matches(/^(RDV|RES)-\d{4}-[0-9A-F]{8}$/, { message: "Référence invalide (exemple : RDV-2026-A1B2C3D4)." })
  reference: string;

  @IsString()
  @MinLength(8, { message: "Numéro de téléphone trop court." })
  @MaxLength(30, { message: "Numéro de téléphone trop long." })
  phone: string;
}
