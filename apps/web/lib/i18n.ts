/**
 * Langues du site. Les adresses ne changent pas : le middleware sert /fr/… ou /en/… selon le cookie
 * `ivologis_lang` (français par défaut), et chaque page existe en statique dans les deux langues.
 * Les textes sont rangés par zone dans `messages/*.ts` : `{ fr: {...}, en: {...} }`, l'anglais typé sur le
 * français, si bien qu'une traduction manquante casse la compilation (jamais de page à moitié traduite).
 */
export const LANGS = ["fr", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "fr";
export const LANG_COOKIE = "ivologis_lang";
/** Sélecteur FR/EN visible partout : toutes les zones sont traduites (site, connexion, espaces, API, PDF). */
export const LANG_SWITCHER_ENABLED = true;

export function isLang(value: unknown): value is Lang {
  return value === "fr" || value === "en";
}

/** Paramètre de route `[lang]` → langue sûre (les valeurs inconnues sont refusées en amont par `dynamicParams = false`). */
export function toLang(value: unknown): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

export const LOCALES: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" };

export function formatDate(value: string | number | Date | null | undefined, lang: Lang, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (value === null || value === undefined || value === "") return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString(LOCALES[lang], options);
}

/** Montant en francs CFA : « 250 000 FCFA » / « 250,000 FCFA ». */
export function formatMoney(amount: number | string | null | undefined, lang: Lang) {
  const n = Number(amount ?? 0);
  return `${new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)} FCFA`;
}

/** Remplace `{nom}` dans un texte traduit. */
export function fill(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

/** Traducteur côté serveur (composants serveur, métadonnées) : même dictionnaire « texte français → anglais » que `t`. */
export function translator(lang: Lang, ...dictionaries: Record<string, string>[]) {
  const en: Record<string, string> = Object.assign({}, ...dictionaries);
  return (fr: string, ...values: unknown[]) => {
    const text = lang === "en" ? (en[fr] ?? fr) : fr;
    const value = (v: unknown) => (lang === "en" && typeof v === "string" && en[v] !== undefined ? en[v] : String(v ?? ""));
    return values.length ? text.replace(/\{(\d+)\}/g, (_, i) => value(values[Number(i)])) : text;
  };
}

/** Un texte par langue (`{ fr, en }`) : l'anglais doit avoir exactement les mêmes clés que le français. */
export type Messages<T> = { fr: T; en: Translation<T> };
type Translation<T> = { [K in keyof T]: T[K] extends string ? string : T[K] extends readonly unknown[] ? T[K] : Translation<T[K]> };
