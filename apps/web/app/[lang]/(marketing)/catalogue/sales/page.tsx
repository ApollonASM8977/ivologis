import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { catalogMeta } from "@/messages/catalog-meta";
import { fetchCatalogPage, toQueryString } from "@/lib/listing-seo";
import { SalesCatalog } from "@/components/catalog/sales-catalog";
import { pageMetadata } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = catalogMeta[lang].sales;
  return pageMetadata(lang, "/catalogue/sales", m.title, m.description);
}

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
