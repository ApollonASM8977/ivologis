"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLang, usePath } from "@/lib/i18n-client";
import { siteMessages } from "@/messages/site";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const KEY = "ivologis_consent"; // « ok » ou « refused » ; absent = bandeau affiché

function device() {
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

/**
 * Mesure d'audience interne et bandeau d'information (C1-5, C1-17).
 * Anonyme : chemin, langue, type d'appareil et site d'origine ; ni cookie, ni adresse IP, ni identifiant.
 * Envoi en tâche de fond (requestIdleCallback) pour ne rien retarder ; « Ne pas suivre » et le refus sont respectés.
 * Les espaces connectés (admin, propriétaire, locataire) ne sont pas mesurés.
 */
export function Audience() {
  const path = usePath();
  const lang = useLang();
  const m = siteMessages[lang].consent;
  const [choice, setChoice] = useState<string | null | undefined>(undefined);
  const [interacted, setInteracted] = useState(false);
  const first = useRef(true);
  const counted = useRef<string | null>(null); // une seule page vue par page affichée (le choix du bandeau relance l'effet)

  useEffect(() => {
    try {
      setChoice(localStorage.getItem(KEY));
    } catch {
      setChoice("ok"); // stockage bloqué : pas de bandeau qui reviendrait à chaque page
    }
    // Bandeau affiché au premier geste (défilement, toucher, clavier) : affiché dès le chargement, il devenait
    // l'élément principal mesuré (LCP) des pages au contenu court et retardait leur score de ~0,5 s.
    const show = () => setInteracted(true);
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, show, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, show));
  }, []);

  useEffect(() => {
    if (choice === undefined || choice === "refused" || navigator.doNotTrack === "1") return;
    if (/^\/(admin|owner|tenant)(\/|$)/.test(path) || counted.current === path) return;
    const referrer = first.current ? document.referrer || undefined : undefined;
    const send = () => {
      counted.current = path;
      first.current = false;
      fetch(`${API}/api/analytics/pageview`, {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, lang, device: device(), referrer }),
      }).catch(() => undefined);
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(send, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(send, 1500);
    return () => clearTimeout(id);
  }, [path, lang, choice]);

  if (choice !== null || !interacted) return null;
  const decide = (value: "ok" | "refused") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
    setChoice(value);
  };
  return (
    <div role="region" aria-label={m.label} className="ivo-rise fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-3 text-xs text-ink-muted shadow-lg sm:left-4 sm:right-auto">
      <p>
        {m.text}{" "}
        <Link href="/confidentialite" className="font-semibold text-primary hover:underline">
          {m.more}
        </Link>
      </p>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => decide("refused")} className="rounded-lg px-3 py-1.5 font-semibold text-ink hover:bg-gray-100">
          {m.refuse}
        </button>
        <button type="button" onClick={() => decide("ok")} className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary/90">
          {m.accept}
        </button>
      </div>
    </div>
  );
}
