"use client";

import { Tag } from "lucide-react";

import { CatalogList } from "@/components/catalog/catalog-list";
import type { CatalogPage } from "@/lib/listing-seo";
import { t } from "@/lib/t-catalog";
import { money } from "@/lib/t";

export function SalesCatalog({ basePath, initialData, initialQs }: { basePath: string; initialData?: CatalogPage | null; initialQs?: string }) {
  return (
    <CatalogList
      kind="sales"
      basePath={basePath}
      initialData={initialData}
      initialQs={initialQs}
      title={t("Biens en vente")}
      subtitle={t("Terrains, villas, appartements et locaux, publiés après contrôle du document foncier")}
      icon={Tag}
      emptyTitle={t("Aucun bien en vente pour le moment")}
      priceLabel={t("Prix")}
      price={(p) => money(Number(p.salePrice ?? 0))}
    />
  );
}
