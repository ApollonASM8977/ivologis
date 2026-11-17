import type { Metadata } from "next";
import { fetchCatalogPage, toQueryString } from "@/lib/listing-seo";
import { SalesCatalog } from "@/components/catalog/sales-catalog";

export const metadata: Metadata = {
  title: "Terrains et maisons à vendre en Côte d'Ivoire",
  description: "Terrains, villas et appartements à vendre à Abidjan et en Côte d'Ivoire, publiés après contrôle du document foncier (ACD, titre foncier).",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PublicCatalogSalesPage({ searchParams }: Props) {
  const qs = toQueryString(await searchParams);
  const initial = await fetchCatalogPage("sales", qs);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <SalesCatalog basePath="/catalogue/sales" initialData={initial} initialQs={qs} />
    </div>
  );
}
