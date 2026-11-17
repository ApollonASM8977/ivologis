import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { map } from "rxjs/operators";
import { AuthenticatedUser } from "../types/authenticated-user";

/**
 * Règle de l'agence (décision D-11) : « tout passe par l'agence ».
 * Un propriétaire ne reçoit jamais les coordonnées d'un locataire ou d'un visiteur ;
 * un locataire ne reçoit jamais celles du propriétaire. Seul le personnel de l'agence les voit.
 * Appliqué à toutes les réponses JSON, pour que de futurs écrans ne puissent pas les exposer par mégarde.
 */
const PERSON_CONTACT = ["phone", "email", "address"];
const TENANT_PRIVATE = [
  ...PERSON_CONTACT,
  "idDocumentType",
  "idDocumentNumber",
  "monthlyIncome",
  "employer",
  "dateOfBirth",
  "placeOfBirth",
  "maritalStatus",
  "emergencyContactName",
  "emergencyContactPhone",
  "guarantorName",
  "guarantorPhone",
  "guarantorAddress",
  "guarantorIdDocument",
];
const GUEST_CONTACT = ["guestPhone", "guestEmail"];

/** Clés dont la valeur désigne « l'autre partie » selon le rôle qui consulte. */
const COUNTERPARTS: Partial<Record<UserRole, { keys: string[]; fields: string[]; guest: boolean }>> = {
  [UserRole.OWNER]: { keys: ["tenant", "currentTenant", "tenants", "user", "requestedBy"], fields: TENANT_PRIVATE, guest: true },
  [UserRole.TENANT]: { keys: ["owner"], fields: PERSON_CONTACT, guest: false },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function strip(target: unknown, fields: string[]) {
  if (Array.isArray(target)) return target.forEach((item) => strip(item, fields));
  if (!isPlainObject(target)) return;
  for (const field of fields) delete target[field];
}

/** Pour les réponses dont la racine est elle-même un locataire (fiche ou liste vue par un propriétaire). */
export function hideTenantPrivate<T>(tenantOrList: T): T {
  strip(tenantOrList, TENANT_PRIVATE);
  return tenantOrList;
}

export function hideCounterpartContacts<T>(data: T, role: UserRole, depth = 0): T {
  const rule = COUNTERPARTS[role];
  if (!rule || depth > 8) return data;
  if (Array.isArray(data)) {
    data.forEach((item) => hideCounterpartContacts(item, role, depth + 1));
    return data;
  }
  if (!isPlainObject(data)) return data;
  if (rule.guest) for (const field of GUEST_CONTACT) delete data[field];
  for (const [key, value] of Object.entries(data)) {
    if (rule.keys.includes(key)) strip(value, rule.fields);
    hideCounterpartContacts(value, role, depth + 1);
  }
  return data;
}

@Injectable()
export class AgencyPrivacyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const user: AuthenticatedUser | undefined = context.switchToHttp().getRequest().user;
    if (!user || !COUNTERPARTS[user.role]) return next.handle();
    return next.handle().pipe(map((data) => hideCounterpartContacts(data, user.role)));
  }
}
