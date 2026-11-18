"use client";

import { LANGS } from "@/lib/i18n";
import { switchLang, useLang } from "@/lib/i18n-client";
import { siteMessages } from "@/messages/site";

/** FR | EN : bascule tout le site (cookie + rechargement). */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const lang = useLang();
  const m = siteMessages[lang].language;
  return (
    <div role="group" aria-label={m.label} className={`inline-flex rounded-lg border border-gray-200 p-0.5 text-xs font-semibold ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          aria-label={m[l]}
          onClick={() => l !== lang && switchLang(l)}
          className={`ivo-press rounded-md px-2 py-1 uppercase transition-colors ${l === lang ? "bg-primary text-white" : "text-ink-muted hover:text-primary"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
