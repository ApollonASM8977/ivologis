import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsIn, IsObject, IsOptional } from "class-validator";

/**
 * Corps de requête stricts pour les routes qui lisaient un champ isolé (C2-4 « mass assignment ») :
 * le ValidationPipe global rejette tout champ inconnu et tout type inattendu.
 */
export class MarkHandledDto {
  @IsBoolean({ message: "« handled » doit valoir vrai ou faux." })
  handled: boolean;
}

export class ImageUploadDto {
  @IsOptional()
  @IsIn(["true", "false"])
  isCover?: string;
}

export class ImportRowsDto {
  @IsArray()
  @ArrayMinSize(1, { message: "Importez entre 1 et 200 locataires à la fois." })
  @ArrayMaxSize(200, { message: "Importez entre 1 et 200 locataires à la fois." })
  @IsObject({ each: true })
  rows: Record<string, unknown>[];
}
