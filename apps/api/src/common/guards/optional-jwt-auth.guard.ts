import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Comme JwtAuthGuard, mais n'empêche jamais la requête : si un jeton valide
 * est présent, req.user est renseigné ; sinon la requête passe en invité.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
