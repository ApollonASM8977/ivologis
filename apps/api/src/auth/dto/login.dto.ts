import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  identifier: string; // email ou téléphone

  @IsString()
  @MinLength(1)
  password: string;
}
