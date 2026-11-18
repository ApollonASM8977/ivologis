import { UserRole } from "@prisma/client";
import {
  Equals,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  inviteCode?: string;

  /** Conditions générales et politique de confidentialité acceptées (case cochée, date enregistrée au journal). */
  @Equals(true, { message: "Acceptez les conditions générales et la politique de confidentialité pour créer votre compte." })
  acceptTerms: boolean;
}
