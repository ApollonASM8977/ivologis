import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { IsString, Length } from "class-validator";
import { Request } from "express";
import { AuthService, SessionMeta } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";

class TwoFactorCodeDto {
  @IsString()
  @Length(6, 6)
  code: string;
}

class SetupTokenDto {
  @IsString()
  setupToken: string;
}

class ConfirmSetupDto {
  @IsString()
  setupToken: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

function metaOf(req: Request): SessionMeta {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, metaOf(req));
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, metaOf(req));
  }

  @Post("logout")
  logout() {
    return { message: "Déconnecté." };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout-all")
  logoutAll(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logoutEverywhere(user.id);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post("2fa/mandatory-setup")
  mandatorySetup(@Body() dto: SetupTokenDto) {
    return this.authService.mandatorySetup(dto.setupToken);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("2fa/mandatory-confirm")
  mandatoryConfirm(@Body() dto: ConfirmSetupDto, @Req() req: Request) {
    return this.authService.mandatoryConfirm(dto.setupToken, dto.code, metaOf(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post("2fa/setup")
  setupTwoFactor(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupTwoFactor(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("2fa/enable")
  enableTwoFactor(@Body() dto: TwoFactorCodeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.enableTwoFactor(user.id, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post("2fa/disable")
  disableTwoFactor(@Body() dto: TwoFactorCodeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.disableTwoFactor(user.id, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get("sessions")
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.listSessions(user.id, user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("sessions/:id")
  revokeSession(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.revokeSession(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
