import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { PermissionKey } from "@ivologis/shared";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { AuthenticatedUser } from "../types/authenticated-user";

/**
 * SUPER_ADMIN a toujours accès à tout. Les autres rôles doivent posséder
 * explicitement la permission requise (assignée par le Super Admin).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const user: AuthenticatedUser = context.switchToHttp().getRequest().user;
    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;

    const hasAll = required.every((key) => user.permissions.includes(key));
    if (!hasAll) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission requise pour cette action.",
      );
    }
    return true;
  }
}
