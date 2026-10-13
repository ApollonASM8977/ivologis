import { IsDateString, IsOptional } from "class-validator";

export class ScheduleVisitDto {
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;
}
