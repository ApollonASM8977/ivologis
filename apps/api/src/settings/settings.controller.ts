import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  /** Public : identité de l'agence pour les mentions légales, le pied de page et les contacts. */
  @Get("public")
  getPublic() {
    return this.settingsService.getPublic();
  }

  // Paramètres complets (taux de commission, modèles de documents) : réservés à l'agence ; les clients lisent /settings/public.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT)
  @Get()
  get() {
    return this.settingsService.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch()
  @Roles(UserRole.SUPER_ADMIN)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
