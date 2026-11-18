"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Îlots interactifs de l'accueil, sans bibliothèque d'animation : tout est en CSS (globals.css, classes `ivo-*`),
 * exécuté par le navigateur hors du fil JavaScript. Plus fluide sur les petits téléphones et en 3G.
 */

export interface MockupLabels {
  overview: string;
  upToDate: string;
  kpis: string[];
  rentValue: string;
  events: string[];
}

export function DashboardMockup({ labels }: { labels: MockupLabels }) {
  const bars = [42, 58, 49, 71, 66, 84];
  const tilt = useRef<HTMLDivElement>(null);

  // Pointeur = souris ET doigt : la carte s'incline vers le pointeur ; le CSS lisse le mouvement.
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current?.style.setProperty("transform", `rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 16).toFixed(2)}deg)`);
  }
  function reset() {
    tilt.current?.style.setProperty("transform", "none");
  }

  return (
    <div className="[perspective:1200px]" onPointerMove={onMove} onPointerLeave={reset} onPointerUp={reset}>
      <div className="ivo-rise" style={{ animationDelay: "150ms" }}>
        <div className="ivo-float">
          <div
            ref={tilt}
            className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-primary/15 transition-transform duration-300 ease-out active:scale-[0.98]"
            aria-hidden="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">{labels.overview}</p>
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-800">{labels.upToDate}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: labels.kpis[0], value: "24" },
                { label: labels.kpis[1], value: labels.rentValue },
                { label: labels.kpis[2], value: "3" },
              ].map((k, i) => (
                <div key={k.label} className="ivo-rise rounded-xl bg-surface p-3" style={{ animationDelay: `${300 + i * 100}ms` }}>
                  <p className="text-[11px] text-ink-muted">{k.label}</p>
                  <p className="mt-1 text-lg font-bold text-ink">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex h-28 items-end gap-2">
              {bars.map((h, i) => (
                <div key={i} className="ivo-grow flex-1" style={{ height: `${h}%`, animationDelay: `${500 + i * 70}ms` }}>
                  {/* Monte une fois, puis « respire » comme un tableau de bord en direct. */}
                  <div className="ivo-breathe h-full rounded-t-md bg-gradient-to-t from-primary to-primary/60" style={{ animationDelay: `${1400 + i * 250}ms` }} />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {labels.events.map((t, i) => (
                <div
                  key={t}
                  className="ivo-slide-in flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-xs text-ink-muted"
                  style={{ animationDelay: `${1000 + i * 120}ms` }}
                >
                  <span className="ivo-ping h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${i * 600}ms` }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Audience {
  key: string;
  label: string;
  title: string;
  intro: string;
  items: string[];
}

export function AudienceTabs({ audiences, label }: { audiences: Audience[]; label: string }) {
  const [index, setIndex] = useState(0);
  const active = audiences[index];
  return (
    <>
      <div role="tablist" aria-label={label} className="mt-10 flex flex-wrap gap-2 border-b border-gray-200">
        {audiences.map((a, i) => (
          <button
            key={a.key}
            role="tab"
            aria-selected={index === i}
            aria-controls={`panel-${a.key}`}
            onClick={() => setIndex(i)}
            className={`relative px-4 pb-3 pt-2 text-sm font-semibold transition-colors ${index === i ? "text-primary" : "text-ink-muted hover:text-ink"}`}
          >
            {a.label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-2 -bottom-px h-0.5 origin-center rounded-full bg-primary transition-transform duration-300 ${index === i ? "scale-x-100" : "scale-x-0"}`}
            />
          </button>
        ))}
      </div>
      {/* La clé relance l'animation d'entrée à chaque changement d'onglet. */}
      <div
        key={active.key}
        id={`panel-${active.key}`}
        role="tabpanel"
        className="ivo-fade-in mt-8 grid items-center gap-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:grid-cols-2"
      >
        <div>
          <h3 className="text-2xl font-bold text-ink">{active.title}</h3>
          <p className="mt-2 text-ink-muted">{active.intro}</p>
        </div>
        <ul className="space-y-3">
          {active.items.map((item, i) => (
            <li key={item} className="ivo-slide-in flex items-start gap-2.5 text-sm text-ink" style={{ animationDelay: `${100 + i * 80}ms` }}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                <Check className="h-3.5 w-3.5 text-success" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-10 rounded-2xl bg-white px-6 shadow-sm">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-gray-100 last:border-0">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-ink hover:text-primary"
              >
                {item.q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-ink-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </h3>
            {/* Hauteur animée en CSS (grille 0fr → 1fr), sans mesurer le contenu en JavaScript. */}
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="pb-5 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
