import { AsyncLocalStorage } from "async_hooks";
import type { NextFunction, Request, Response } from "express";
import { EN } from "./en";

/**
 * Bilingue de l'API (D-14). Le français est la langue source : chaque message reste écrit en français dans le code,
 * et `en.ts` donne sa traduction (clé = texte exact, `{0}`, `{1}`… pour les parties variables).
 * Langue de la requête : en-tête `Accept-Language` envoyé par le site (« en » ou « fr »).
 * Notifications : langue du destinataire (`User.language`), pas celle de la personne qui agit.
 */
export type Lang = "fr" | "en";

const store = new AsyncLocalStorage<{ lang: Lang }>();

export function langFromHeader(header?: string | string[]): Lang {
  const value = Array.isArray(header) ? header[0] : header;
  return value && /^\s*en\b/i.test(value) ? "en" : "fr";
}

export function requestLang(): Lang {
  return store.getStore()?.lang ?? "fr";
}

/** Exécute `fn` dans une langue donnée (ex. quittance générée dans la langue du locataire). */
export function runWithLang<T>(lang: Lang | null | undefined, fn: () => T): T {
  return store.run({ lang: lang === "en" ? "en" : "fr" }, fn);
}

export function langMiddleware(req: Request, _res: Response, next: NextFunction) {
  store.run({ lang: langFromHeader(req.headers["accept-language"]) }, next);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Gabarits avec parties variables, du plus précis (plus de texte fixe) au plus général.
const PATTERNS = Object.keys(EN)
  .filter((k) => /\{\d+\}/.test(k))
  .map((key) => ({ key, re: new RegExp(`^${escape(key).replace(/\\\{\d+\\\}/g, "([\\s\\S]*?)")}$`), order: [...key.matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1])) }))
  .sort((a, b) => b.key.replace(/\{\d+\}/g, "").length - a.key.replace(/\{\d+\}/g, "").length);

const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_RE = MONTHS_FR.join("|");

/** Valeurs insérées dans un message (dates longues, mois, montants) : écrites à l'anglaise. */
function localizeValue(value: string) {
  return value
    .replace(new RegExp(`\\b(1er|\\d{1,2}) (${MONTH_RE}) (\\d{4})`, "g"), (_, d, m, y) => `${d === "1er" ? 1 : d} ${MONTHS_EN[MONTHS_FR.indexOf(m)]} ${y}`)
    .replace(new RegExp(`\\b(${MONTH_RE}) (\\d{4})`, "g"), (_, m, y) => `${MONTHS_EN[MONTHS_FR.indexOf(m)]} ${y}`)
    // Milliers « 150 000 » → « 150,000 » (montants ; les numéros de téléphone, groupés par 2, ne sont pas touchés).
    .replace(/\b\d{1,3}(?:[   ]\d{3})+\b/g, (n) => n.replace(/[   ]/g, ","));
}

/** Traduit un message français (exact, puis par gabarit avec traduction des parties variables). */
export function translateText(fr: string, lang: Lang = requestLang(), depth = 0): string {
  if (lang === "fr" || !fr) return fr;
  const exact = EN[fr];
  if (exact !== undefined) return exact;
  if (depth < 4) {
    for (const p of PATTERNS) {
      const m = fr.match(p.re);
      if (!m) continue;
      const values = m.slice(1);
      return EN[p.key].replace(/\{(\d+)\}/g, (_, i) => translateText(values[p.order.indexOf(Number(i))] ?? "", lang, depth + 1));
    }
  }
  return localizeValue(fr);
}

/** Texte de document (PDF, CSV) dans la langue courante : `tr("Émise le {0}", date)`. */
export function tr(fr: string, ...values: unknown[]): string {
  const text = requestLang() === "en" ? (EN[fr] ?? fr) : fr;
  return values.length ? text.replace(/\{(\d+)\}/g, (_, i) => String(values[Number(i)] ?? "")) : text;
}

export function locale(lang: Lang = requestLang()) {
  return lang === "en" ? "en-GB" : "fr-FR";
}
