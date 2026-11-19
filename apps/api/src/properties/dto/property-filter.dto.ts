import { PropertyStatus, PropertyType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class PropertyFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  /** File « À vérifier » de l'agence (P1-17). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  toReview?: boolean;
}
