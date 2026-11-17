"use client";

import { KeyRound } from "lucide-react";
import { formatXOF } from "@ivologis/shared";
import { CatalogList } from "@/components/catalog/catalog-list";
import type { CatalogPage } from "@/lib/listing-seo";

export function RentalsCatalog({ basePath, initialData, initialQs }: { basePath: string; initialData?: CatalogPage | null; initialQs?: string }) {
  return (
    <CatalogList
      kind="rentals"
      basePath={basePath}
      initialData={initialData}
      initialQs={initialQs}
      title="Logements à louer"
      subtitle="Location au mois : loyer, avance et caution affichés, frais d'agence encadrés"
      icon={KeyRound}
      emptyTitle="Aucun logement à louer pour le moment"
      priceLabel="Loyer"
      price={(p) => `${formatXOF(Number(p.rentAmount))} / mois`}
      showFurnished
    />
  );
}
