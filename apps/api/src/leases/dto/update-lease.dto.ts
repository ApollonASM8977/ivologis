import { IsEnum, IsOptional, IsString } from "class-validator";
import { SignatureStatus } from "@prisma/client";

export class UpdateLeaseDto {
  @IsOptional()
  @IsString()
  specialConditions?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsEnum(SignatureStatus)
  signatureStatus?: SignatureStatus;
}
