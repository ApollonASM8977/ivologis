import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class DecideTenantRequestDto {
  @IsIn(["ACCEPTEE", "REFUSEE"])
  status: "ACCEPTEE" | "REFUSEE";

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminResponse?: string;
}
