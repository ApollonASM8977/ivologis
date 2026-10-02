import { PropertyStatus, PropertyType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
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
}
