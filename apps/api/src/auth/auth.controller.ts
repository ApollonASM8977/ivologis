import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { IsString, Length } from "class-validator";

class TwoFactorCodeDto {
  @IsString()
  @Length(6, 6)
  code: string;
}

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
