export function publicUser<T extends Record<string, unknown>>(user: T) {
  const { passwordHash: _passwordHash, totpSecret: _totpSecret, tokenVersion: _tokenVersion, ...rest } = user as T & {
    passwordHash?: unknown;
    totpSecret?: unknown;
    tokenVersion?: unknown;
  };
  return rest;
}
