import { use } from "react";
import { LangContext } from "@/lib/i18n-client";
import { LOCALES, formatMoney, type Lang } from "@/lib/i18n";

/**
 * Traduction des composants clients : le texte français sert de clé (`t("Enregistrer")`), un dictionnaire anglais
 * par zone (`messages/en/*.ts`) donne la traduction. `{0}`, `{1}`… sont remplacés par les valeurs passées.
 *
 * Langue courante : au rendu serveur, le contexte de la page (`use`, autorisé dans les boucles et conditions) ;
 * dans le navigateur, l'attribut `lang` du document (fixé par le serveur, la langue ne change qu'avec un rechargement),
 * ce qui permet aussi d'appeler `t` dans les gestionnaires d'évènements (notifications, confirmations).
 * Ne jamais appeler `t` au niveau du module : traduire au moment de l'affichage (`t(item.label)`).
 * `npm run check:i18n` vérifie que chaque texte français du code a sa traduction.
 */
export function currentLang(): Lang {
  if (typeof window === "undefined") return use(LangContext);
  return document.documentElement.lang === "en" ? "en" : "fr";
}

export type Dictionary = Record<string, string>;

export function makeT(...dictionaries: Dictionary[]) {
  const en: Dictionary = Object.assign({}, ...dictionaries);
  return function t(fr: string, ...values: unknown[]): string {
    const english = currentLang() === "en";
    const text = english ? (en[fr] ?? fr) : fr;
    // Une valeur qui est elle-même un texte connu (libellé, « d'entrée »…) est traduite aussi ; noms et nombres restent tels quels.
    const value = (v: unknown) => (english && typeof v === "string" && en[v] !== undefined ? en[v] : String(v ?? ""));
    return values.length ? text.replace(/\{(\d+)\}/g, (_, i) => value(values[Number(i)])) : text;
  };
}

/** Locale Intl de la langue courante (« fr-FR » / « en-GB »), pour les dates et nombres. */
export function locale() {
  return LOCALES[currentLang()];
}

/** Montant en francs CFA selon la langue (remplace `formatXOF` dans l'interface). */
export function money(amount: number | string | null | undefined) {
  return formatMoney(amount, currentLang());
}
