import { MaintenanceIssueType, MaintenancePriority } from "@prisma/client";
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

export class CreateMaintenanceDto {
  @IsUUID()
  propertyId: string;

  @IsEnum(MaintenanceIssueType, { message: "Type de problème invalide." })
  issueType: MaintenanceIssueType;

  @IsString()
  @MinLength(5, { message: "Décrivez le problème en quelques mots (5 caractères minimum)." })
  @MaxLength(2000, { message: "La description est trop longue (2 000 caractères maximum)." })
  description: string;

  @IsOptional()
  @IsEnum(MaintenancePriority, { message: "Priorité invalide." })
  priority?: MaintenancePriority;

  // Uniquement des fichiers envoyés via POST /maintenance/photos : pas d'URL externe.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: "5 photos maximum." })
  @Matches(/^\/api\/files\/[0-9a-f-]{36}$/, { each: true, message: "Photo invalide." })
  photos?: string[];
}
