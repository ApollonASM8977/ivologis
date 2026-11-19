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

export const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Change de langue pour tout le site : cookie d'un an puis rechargement, pour que tout (serveur compris) bascule d'un coup. */
export function switchLang(lang: Lang) {
  // `secure` en https (S-22) ; pas en http local, sinon le navigateur refuserait le cookie.
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  // Compte connecté : l'API envoie ensuite notifications et quittances dans cette langue.
  const token = document.cookie.match(/(?:^|;\s*)ivologis_token=([^;]+)/)?.[1];
  const saveOnAccount = token
    ? fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${decodeURIComponent(token)}`, "Accept-Language": lang },
        body: JSON.stringify({ language: lang }),
      }).catch(() => undefined)
    : Promise.resolve();
  // La page hors connexion est gardée en cache par le service worker : la recopier dans la nouvelle langue.
  const refreshOffline =
    "caches" in window
      ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.open(k).then((c) => c.add("/offline")).catch(() => undefined))))
      : Promise.resolve();
  Promise.race([Promise.all([refreshOffline, saveOnAccount]), new Promise((r) => setTimeout(r, 2000))]).finally(() => window.location.reload());
}
