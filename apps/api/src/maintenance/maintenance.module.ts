import { Module } from "@nestjs/common";
import { MaintenanceService } from "./maintenance.service";
import { MaintenanceController } from "./maintenance.controller";
import { TechniciansController } from "./technicians.controller";

@Module({
  providers: [MaintenanceService],
  controllers: [MaintenanceController, TechniciansController],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
