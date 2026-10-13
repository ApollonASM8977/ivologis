import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateVisitRequestDto {
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
