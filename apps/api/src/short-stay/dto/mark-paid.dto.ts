import { IsBoolean } from "class-validator";

export class MarkPaidDto {
  @IsBoolean()
  isPaid: boolean;
}
