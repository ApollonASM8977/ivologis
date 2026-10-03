import { IsString, Matches, MaxLength } from "class-validator";

export class SignFileDto {
  @IsString()
  @MaxLength(200)
  @Matches(/^\/api\/files\/[0-9a-f-]{36}$/, { message: "Chemin de fichier invalide." })
  url: string;
}
