import type { Metadata } from "next";
import { fetchCatalogPage, toQueryString } from "@/lib/listing-seo";
import { RentalsCatalog } from "@/components/catalog/rentals-catalog";

export const metadata: Metadata = {
  title: "Appartements et maisons à louer à Abidjan",
  description: "Logements à louer au mois à Abidjan : loyer, avance et caution affichés, frais d'agence encadrés. Demandez une visite sans créer de compte.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PublicCatalogRentalsPage({ searchParams }: Props) {
  const qs = toQueryString(await searchParams);
  const initial = await fetchCatalogPage("rentals", qs);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <RentalsCatalog basePath="/catalogue/locations" initialData={initial} initialQs={qs} />
    </div>
  );
}
