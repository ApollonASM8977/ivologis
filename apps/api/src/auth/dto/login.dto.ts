import { IsOptional, IsString, Length, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  identifier: string; // email ou téléphone

  @IsString()
  @MinLength(1)
  password: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  code?: string;
}
