import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { catalogMeta } from "@/messages/catalog-meta";
import { fetchCatalogPage, toQueryString } from "@/lib/listing-seo";
import { ShortStayCatalog } from "@/components/catalog/short-stay-catalog";
import { pageMetadata } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = catalogMeta[lang].shortStay;
  return pageMetadata(lang, "/catalogue/short-stay", m.title, m.description);
}

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
