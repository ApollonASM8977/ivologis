import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { catalogMeta } from "@/messages/catalog-meta";
import { fetchCatalogPage, toQueryString } from "@/lib/listing-seo";
import { RentalsCatalog } from "@/components/catalog/rentals-catalog";
import { pageMetadata } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = catalogMeta[lang].rentals;
  return pageMetadata(lang, "/catalogue/locations", m.title, m.description);
}

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
