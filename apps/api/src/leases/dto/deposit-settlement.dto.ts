import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsNumber, IsString, Max, MaxLength, Min, ValidateNested } from "class-validator";

export class DepositDeductionDto {
  @IsString()
  @MaxLength(160)
  label: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100_000_000)
  amount: number;
}

export class DepositSettlementDto {
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => DepositDeductionDto)
  deductions: DepositDeductionDto[];
}
