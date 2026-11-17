import { AccountStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "Le nom est trop court." })
  @MaxLength(120, { message: "Le nom est trop long." })
  fullName?: string;

  // Seulement une image envoyée sur la plateforme (pas de lien externe affiché aux autres utilisateurs).
  @IsOptional()
  @Matches(/^\/api\/files\/[0-9a-f-]{36}$/, { message: "Photo de profil invalide." })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: "Numéro de téléphone trop court." })
  @MaxLength(20, { message: "Numéro de téléphone trop long." })
  phone?: string;
}

export class UpdatePermissionsDto {
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateStatusDto {
  @IsEnum(AccountStatus, { message: "Statut de compte invalide." })
  status: AccountStatus;
}
