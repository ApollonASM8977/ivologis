import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, ValidateIf } from "class-validator";

export class CreateContactDto {
  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsOptional()
  @ValidateIf((o: CreateContactDto) => !!o.phone)
  @Matches(/^\+?[0-9 ]{8,20}$/, { message: "Numéro de téléphone invalide." })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  portfolioSize?: string;

  @IsString()
  @Length(10, 2000)
  message: string;
}
