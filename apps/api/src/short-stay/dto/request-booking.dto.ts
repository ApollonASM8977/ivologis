import { IsDateString, IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class RequestShortStayBookingDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  /** Requis uniquement pour une demande envoyée sans compte (invité). */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  guestName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  guestPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  guestEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
