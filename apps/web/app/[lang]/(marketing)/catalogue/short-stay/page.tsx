import type { Metadata } from "next";
import { fetchCatalogPage, toQueryString } from "@/lib/listing-seo";
import { ShortStayCatalog } from "@/components/catalog/short-stay-catalog";

export const metadata: Metadata = {
  title: "Résidences meublées à la nuitée",
  description: "Résidences meublées à louer à la nuitée à Abidjan et sur la côte, disponibilités en ligne, réservation sans compte.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PublicCatalogShortStayPage({ searchParams }: Props) {
  const qs = toQueryString(await searchParams);
  const initial = await fetchCatalogPage("short-stay", qs);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <ShortStayCatalog basePath="/catalogue/short-stay" initialData={initial} initialQs={qs} />
    </div>
  );
}
