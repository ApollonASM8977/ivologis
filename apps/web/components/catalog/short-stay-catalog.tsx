"use client";

import { CalendarRange } from "lucide-react";

import { CatalogList } from "@/components/catalog/catalog-list";
import type { CatalogPage } from "@/lib/listing-seo";
import { t } from "@/lib/t-catalog";
import { money } from "@/lib/t";

export function ShortStayCatalog({ basePath, initialData, initialQs }: { basePath: string; initialData?: CatalogPage | null; initialQs?: string }) {
  return (
    <CatalogList
      kind="short-stay"
      basePath={basePath}
      initialData={initialData}
      initialQs={initialQs}
      title={t("Résidences meublées en courte durée")}
      subtitle={t("Séjours à la nuitée, disponibilités en ligne, publication validée par l'agence")}
      icon={CalendarRange}
      emptyTitle={t("Aucune résidence disponible pour le moment")}
      priceLabel={t("Prix / nuit")}
      price={(p) => (p.shortStayNightlyRate ? `${money(Number(p.shortStayNightlyRate))} / nuit` : t("Tarif sur demande"))}
    />
  );
}
