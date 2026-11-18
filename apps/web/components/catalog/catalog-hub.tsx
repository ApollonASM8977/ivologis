"use client";

import Link from "next/link";
import { KeyRound, Tag, CalendarRange, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/t-catalog";

const ENTRIES = [
  { path: "locations", icon: KeyRound, title: "Logements à louer", text: "Location au mois, coût d'entrée détaillé" },
  { path: "sales", icon: Tag, title: "Biens en vente", text: "Terrains, villas, appartements, document foncier contrôlé" },
  { path: "short-stay", icon: CalendarRange, title: "Résidences meublées", text: "Séjours à la nuitée, disponibilités en ligne" },
  { path: "my-requests", icon: CalendarCheck, title: "Mes demandes", text: "Suivi de vos visites et réservations" },
];

export function CatalogHub({ basePath }: { basePath: string }) {
  return (
    <div>
      <PageHeader title={t("Catalogue")} subtitle={t("Louer, acheter ou séjourner : toutes les annonces publiées par l'agence")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ENTRIES.map((e) => (
          <Link key={e.path} href={`${basePath}/${e.path}`}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
              <e.icon className="h-6 w-6 text-primary" />
              <p className="mt-3 font-semibold text-ink">{t(e.title)}</p>
              <p className="mt-1 text-sm text-ink-muted">{t(e.text)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
