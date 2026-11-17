import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  // Messages en français à la place du « Unauthorized » de Passport ; les erreurs de JwtStrategy passent telles quelles.
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info?: { name?: string }): TUser {
    if (err) throw err;
    if (!user) {
      throw new UnauthorizedException(info?.name === "TokenExpiredError" ? "Session expirée. Reconnectez-vous." : "Connexion requise.");
    }
    return user;
  }
}
