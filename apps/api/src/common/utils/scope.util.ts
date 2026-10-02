import { ForbiddenException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../types/authenticated-user";

/**
 * Construit la clause `where.ownerId` à appliquer à une requête Prisma en
 * fonction du rôle courant. Un propriétaire externe ne doit JAMAIS pouvoir
 * lister ou consulter les biens/paiements/locataires d'un autre propriétaire.
 *
 * - SUPER_ADMIN / ADMIN_AGENT : pas de restriction (undefined = pas de filtre).
 * - OWNER : forcé sur son propre ownerId.
 * - TENANT : n'a pas de sens ici, on refuse.
 */
export function ownerScope(user: AuthenticatedUser): string | undefined {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_AGENT) {
    return undefined;
  }
  if (user.role === UserRole.OWNER) {
    if (!user.ownerId) {
      throw new ForbiddenException("Aucun profil propriétaire associé à ce compte.");
    }
    return user.ownerId;
  }
  throw new ForbiddenException("Accès non autorisé.");
}

/** Vérifie qu'un propriétaire externe n'accède qu'à ses propres données. */
export function assertOwnsResource(user: AuthenticatedUser, resourceOwnerId: string) {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_AGENT) {
    return;
  }
  if (user.role === UserRole.OWNER && user.ownerId === resourceOwnerId) {
    return;
  }
  throw new ForbiddenException("Vous n'avez pas accès à cette ressource.");
}

/** Vérifie qu'un locataire n'accède qu'à ses propres données. */
export function assertOwnsTenantResource(user: AuthenticatedUser, resourceTenantId: string) {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_AGENT) {
    return;
  }
  if (user.role === UserRole.TENANT && user.tenantId === resourceTenantId) {
    return;
  }
  throw new ForbiddenException("Vous n'avez pas accès à cette ressource.");
}
