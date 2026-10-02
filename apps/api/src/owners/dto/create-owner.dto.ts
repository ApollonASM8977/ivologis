import { DocumentType } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateOwnerDto {
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
  @IsEnum(DocumentType)
  idDocumentType?: DocumentType;

  @IsOptional()
  @IsString()
  idDocumentNumber?: string;

  @IsOptional()
  @IsString()
  idDocumentUrl?: string;

  /** Si fourni, crée immédiatement un compte de connexion pour ce propriétaire. */
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
