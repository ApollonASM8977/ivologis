"use client";

import { Tag } from "lucide-react";
import { formatXOF } from "@ivologis/shared";
import { CatalogList } from "@/components/catalog/catalog-list";
import type { CatalogPage } from "@/lib/listing-seo";

export function SalesCatalog({ basePath, initialData, initialQs }: { basePath: string; initialData?: CatalogPage | null; initialQs?: string }) {
  return (
    <CatalogList
      kind="sales"
      basePath={basePath}
      initialData={initialData}
      initialQs={initialQs}
      title="Biens en vente"
      subtitle="Terrains, villas, appartements et locaux, publiés après contrôle du document foncier"
      icon={Tag}
      emptyTitle="Aucun bien en vente pour le moment"
      priceLabel="Prix"
      price={(p) => formatXOF(Number(p.salePrice ?? 0))}
    />
  );
}
