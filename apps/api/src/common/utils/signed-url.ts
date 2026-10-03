import { createHmac, timingSafeEqual } from "crypto";

export const SIGNED_URL_TTL_SECONDS = 10 * 60;

function digest(path: string, exp: number, secret: string) {
  return createHmac("sha256", secret).update(`${path}|${exp}`).digest("hex");
}

export function signFilePath(path: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  const exp = nowSeconds + SIGNED_URL_TTL_SECONDS;
  return `${path}?exp=${exp}&sig=${digest(path, exp, secret)}`;
}

export function verifyFileSignature(
  path: string,
  exp: string | undefined,
  sig: string | undefined,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  const expNumber = Number(exp);
  if (!exp || !sig || !Number.isInteger(expNumber) || expNumber < nowSeconds) return false;
  const expected = Buffer.from(digest(path, expNumber, secret), "hex");
  const received = Buffer.from(sig, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
