import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, Max, Min } from "class-validator";

export class RentRevisionDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100_000_000)
  newRent: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}
