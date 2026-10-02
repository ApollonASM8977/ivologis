import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}

export function toSkipTake(pagination: PaginationDto) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;
  return { skip: (page - 1) * limit, take: limit };
}
