import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreatePayoutDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100_000_000_000)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
