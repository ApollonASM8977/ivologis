import { randomUUID } from "crypto";

/** Référence lisible à communiquer à un visiteur (ex : RDV-2026-A1B2C3D4). */
export function generateReference(prefix: string) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}
