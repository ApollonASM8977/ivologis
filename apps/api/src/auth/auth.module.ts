import { Module } from "@nestjs/common";
import { JwtModule, JwtSignOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [
    PassportModule,
    AuditModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // « 7d », « 12h »… (format de jsonwebtoken) ; @nestjs/jwt 11 exige son type exact.
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as JwtSignOptions["expiresIn"] },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
