import { UserRole } from "@prisma/client";

/** Payload attaché à `request.user` par le JwtStrategy après validation du token. */
export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: string[];
  ownerId: string | null;
  tenantId: string | null;
}
