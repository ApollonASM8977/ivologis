"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { t } from "@/lib/t-spaces";
import { locale } from "@/lib/t";

interface Summary {
  days: number;
  total: number;
  perDay: { day: string; views: number }[];
  pages: { path: string; views: number }[];
  langs: { lang: string; views: number }[];
  devices: { device: string; views: number }[];
  referrers: { host: string; views: number }[];
}

const DEVICE: Record<string, string> = { mobile: "Téléphone", tablet: "Tablette", desktop: "Ordinateur" };
const LANG: Record<string, string> = { fr: "Français", en: "Anglais" };

/** Mesure d'audience interne (anonyme, sans cookie) du site public, sur 30 jours. */
export function AudienceCard() {
  const { data } = useQuery<Summary>({ queryKey: ["analytics", "summary"], queryFn: async () => (await api.get("/analytics/summary?days=30")).data });
  if (!data) return null;
  const max = Math.max(1, ...data.perDay.map((d) => d.views));
  const share = (n: number) => `${Math.round((n / Math.max(1, data.total)) * 100)} %`;
  return (
    <Card className="mt-4">
      <CardHeader title={t("Audience du site")} subtitle={t("Pages publiques vues ces 30 derniers jours, mesure anonyme sans cookie")} />
      <p className="flex items-center gap-2 text-2xl font-bold text-ink">
        <Eye className="h-5 w-5 text-primary" aria-hidden="true" /> {data.total.toLocaleString(locale())} <span className="text-sm font-medium text-ink-muted">{t("pages vues")}</span>
      </p>
      {data.perDay.length > 0 && (
        <div className="mt-4 flex h-16 items-end gap-0.5" aria-hidden="true">
          {data.perDay.map((d) => (
            <div key={d.day} title={`${d.day} : ${d.views}`} className="flex-1 rounded-t bg-primary/70" style={{ height: `${Math.max(6, (d.views / max) * 100)}%` }} />
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
        <div>
          <p className="mb-2 font-semibold text-ink">{t("Pages les plus vues")}</p>
          <ul className="space-y-1 text-ink-muted">
            {data.pages.map((p) => (
              <li key={p.path} className="flex justify-between gap-2">
                <span className="truncate">{p.path}</span>
                <span className="font-medium text-ink">{p.views}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-ink">{t("Langues et appareils")}</p>
          <ul className="space-y-1 text-ink-muted">
            {data.langs.map((l) => (
              <li key={l.lang} className="flex justify-between">
                <span>{t(LANG[l.lang] ?? l.lang)}</span>
                <span className="font-medium text-ink">{share(l.views)}</span>
              </li>
            ))}
            {data.devices.map((d) => (
              <li key={d.device} className="flex justify-between">
                <span>{t(DEVICE[d.device] ?? d.device)}</span>
                <span className="font-medium text-ink">{share(d.views)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-ink">{t("Sites d'origine")}</p>
          {data.referrers.length ? (
            <ul className="space-y-1 text-ink-muted">
              {data.referrers.map((r) => (
                <li key={r.host} className="flex justify-between gap-2">
                  <span className="truncate">{r.host}</span>
                  <span className="font-medium text-ink">{r.views}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted">{t("Accès direct uniquement pour l'instant.")}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
