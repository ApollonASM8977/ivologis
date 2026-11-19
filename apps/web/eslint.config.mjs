// P1-14 : règles Next.js (Core Web Vitals, hooks React, accessibilité de base) ; la CI échoue sur une erreur.
// eslint-config-next 15.5 est au format « eslintrc » : FlatCompat le traduit pour ESLint 9.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"] },
  ...compat.extends("next/core-web-vitals"),
];

export default config;
