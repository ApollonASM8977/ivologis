"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LANG, LANG_COOKIE, type Lang } from "@/lib/i18n";

/**
 * Chemin tel que l'utilisateur le voit (« /admin/dashboard »). Les pages statiques sont construites sous /fr/… et /en/… :
 * `usePathname()` y renvoie « /fr/admin/dashboard » au rendu serveur, d'où un écart d'hydratation (erreur React #418).
 */
export function usePath() {
  return (usePathname() ?? "/").replace(/^\/(fr|en)(?=\/|$)/, "") || "/";
}

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Change de langue pour tout le site : cookie d'un an puis rechargement, pour que tout (serveur compris) bascule d'un coup. */
export function switchLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}
