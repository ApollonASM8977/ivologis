import { createHmac, randomInt } from "crypto";

// No 0/O/1/I: the code is read aloud or retyped from a WhatsApp message.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 8;
export const INVITE_TTL_DAYS = 7;

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

export function normalizeInviteCode(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

// Keyed hash: a leaked hash (e.g. visible in a tenant list) cannot be brute-forced offline.
export function hashInviteCode(code: string, secret: string): string {
  return createHmac("sha256", secret).update(normalizeInviteCode(code)).digest("hex");
}

export function inviteExpiry(now = new Date()): Date {
  return new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}
