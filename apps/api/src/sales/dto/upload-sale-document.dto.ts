import { SaleDocumentType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class UploadSaleDocumentDto {
  @IsEnum(SaleDocumentType)
  type: SaleDocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}
