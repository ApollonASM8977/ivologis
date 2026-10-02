import { DocumentType, MaritalStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsEnum(DocumentType)
  idDocumentType?: DocumentType;

  @IsOptional()
  @IsString()
  idDocumentNumber?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  employer?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monthlyIncome?: number;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  guarantorName?: string;

  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @IsOptional()
  @IsString()
  guarantorIdDocument?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
