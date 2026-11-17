"use client";

import { CalendarRange } from "lucide-react";
import { formatXOF } from "@ivologis/shared";
import { CatalogList } from "@/components/catalog/catalog-list";

export function ShortStayCatalog({ basePath }: { basePath: string }) {
  return (
    <CatalogList
      kind="short-stay"
      basePath={basePath}
      title="Résidences meublées en courte durée"
      subtitle="Séjours à la nuitée, disponibilités en ligne, publication validée par l'agence"
      icon={CalendarRange}
      emptyTitle="Aucune résidence disponible pour le moment"
      priceLabel="Prix / nuit"
      price={(p) => (p.shortStayNightlyRate ? `${formatXOF(Number(p.shortStayNightlyRate))} / nuit` : "Tarif sur demande")}
    />
  );
}
