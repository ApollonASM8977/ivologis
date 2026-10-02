import { IsDateString, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class RenewLeaseDto {
  @IsDateString()
  newEndDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  newRentAmount?: number;
}

export class TerminateLeaseDto {
  reason?: string;
}
