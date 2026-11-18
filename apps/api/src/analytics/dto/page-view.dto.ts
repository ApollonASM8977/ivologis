import { IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";

/** Page vue envoyée par le site : aucune donnée personnelle (ni IP, ni identifiant, ni cookie). */
export class PageViewDto {
  @IsString()
  @MaxLength(200)
  @Matches(/^\//, { message: "Chemin invalide." })
  path: string;

  @IsIn(["fr", "en"])
  lang: string;

  @IsIn(["mobile", "tablet", "desktop"])
  device: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  referrer?: string;
}
