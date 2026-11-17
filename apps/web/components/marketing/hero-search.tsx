"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Scale, PhoneCall } from "lucide-react";
import { AUTRES_VILLES, COMMUNES_ABIDJAN } from "@ivologis/shared";

const MODES = [
  { key: "locations", label: "Louer", budget: "Loyer max / mois" },
  { key: "sales", label: "Acheter", budget: "Budget max" },
  { key: "short-stay", label: "Séjourner", budget: "Prix max / nuit" },
] as const;

const PROMISES = [
  { icon: Scale, text: "Avance et caution limitées à 2 mois chacune, coût d'entrée affiché" },
  { icon: ShieldCheck, text: "Terrains et maisons publiés après contrôle du document foncier" },
  { icon: PhoneCall, text: "Vous parlez à l'agence, jamais à un démarcheur" },
];

/** Accroche de la vitrine : la recherche d'un bien est la première action proposée, dès le premier écran mobile. */
export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]["key"]>("locations");
  const current = MODES.find((m) => m.key === mode)!;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["zone", "maxPrice"]) {
      const value = String(form.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    const query = params.toString();
    router.push(`/catalogue/${mode}${query ? `?${query}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:pt-16 lg:pb-20">
        <p className="text-sm font-semibold text-accent">Abidjan et Côte d&apos;Ivoire</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.1] text-primary-dark sm:text-5xl">
          Trouvez votre logement ou votre terrain, sans mauvaise surprise.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Logements à louer, terrains et maisons à vendre, résidences meublées : des annonces publiées par l&apos;agence, avec ce que vous payez vraiment
          à l&apos;entrée.
        </p>

        <form onSubmit={onSubmit} className="mt-8 max-w-3xl rounded-2xl bg-white p-3 shadow-lg shadow-primary-dark/5 ring-1 ring-black/5">
          <div role="tablist" aria-label="Type de recherche" className="flex gap-1 p-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => setMode(m.key)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === m.key ? "bg-primary text-white" : "text-ink-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="mt-2 grid gap-2 p-1 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="sr-only">Commune ou ville</span>
              <select name="zone" defaultValue="" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-ink">
                <option value="">Toutes les communes</option>
                <optgroup label="Abidjan">
                  {COMMUNES_ABIDJAN.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Autres villes">
                  {AUTRES_VILLES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="block">
              <span className="sr-only">{current.budget} en FCFA</span>
              <input
                name="maxPrice"
                type="number"
                min={0}
                step={5000}
                inputMode="numeric"
                placeholder={`${current.budget} (FCFA)`}
                className="h-12 w-full rounded-xl border border-gray-200 px-3 text-sm text-ink placeholder:text-ink-muted"
              />
            </label>
            <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white hover:bg-[#9A4222]">
              <Search className="h-4 w-4" /> Rechercher
            </button>
          </div>
        </form>

        <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          {PROMISES.map((p) => (
            <li key={p.text} className="flex items-start gap-2.5 text-sm text-ink">
              <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {p.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
