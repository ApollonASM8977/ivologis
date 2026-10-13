import { Module } from "@nestjs/common";
import { ShortStayService } from "./short-stay.service";
import { ShortStayController } from "./short-stay.controller";

@Module({
  providers: [ShortStayService],
  controllers: [ShortStayController],
  exports: [ShortStayService],
})
export class ShortStayModule {}
