import { PaymentMethod } from "@prisma/client";
import { IsEnum } from "class-validator";

export class PayRentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
