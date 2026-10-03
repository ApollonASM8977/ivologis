import { IsDateString, IsEnum, IsOptional, IsString, Length, MaxLength } from "class-validator";
import { TenantRequestType } from "@prisma/client";

export class CreateTenantRequestDto {
  @IsEnum(TenantRequestType)
  type: TenantRequestType;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsString()
  @Length(10, 2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  attachmentUrl?: string;
}
