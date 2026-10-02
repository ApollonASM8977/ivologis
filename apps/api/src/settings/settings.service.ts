import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.companySettings.findFirst();
    if (settings) return settings;
    return this.prisma.companySettings.create({ data: {} });
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();
    return this.prisma.companySettings.update({ where: { id: settings.id }, data: dto });
  }
}
