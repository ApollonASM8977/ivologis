"use client";

import { KeyRound } from "lucide-react";

import { CatalogList } from "@/components/catalog/catalog-list";
import type { CatalogPage } from "@/lib/listing-seo";
import { t } from "@/lib/t-catalog";
import { money } from "@/lib/t";

export function RentalsCatalog({ basePath, initialData, initialQs }: { basePath: string; initialData?: CatalogPage | null; initialQs?: string }) {
  return (
    <CatalogList
      kind="rentals"
      basePath={basePath}
      initialData={initialData}
      initialQs={initialQs}
      title={t("Logements à louer")}
      subtitle={t("Location au mois : loyer, avance et caution affichés, frais d'agence encadrés")}
      icon={KeyRound}
      emptyTitle={t("Aucun logement à louer pour le moment")}
      priceLabel={t("Loyer")}
      price={(p) => t("{0} / mois", money(Number(p.rentAmount)))}
      showFurnished
    />
  );
}
