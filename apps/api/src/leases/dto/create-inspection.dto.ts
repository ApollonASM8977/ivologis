import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { InspectionType } from "@prisma/client";

export const INSPECTION_CONDITIONS = ["NEUF", "BON", "USAGE", "DEGRADE", "MAUVAIS"] as const;

export class InspectionRoomDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsIn(INSPECTION_CONDITIONS as unknown as string[])
  condition: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  photoUrls?: string[];
}

export class CreateInspectionDto {
  @IsEnum(InspectionType)
  type: InspectionType;

  @IsDateString()
  inspectionDate: string;

  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => InspectionRoomDto)
  rooms: InspectionRoomDto[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  generalNotes?: string;
}
