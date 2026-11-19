import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { catalogMeta } from "@/messages/catalog-meta";
import { CatalogHub } from "@/components/catalog/catalog-hub";
import { pageMetadata } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = catalogMeta[lang].hub;
  return pageMetadata(lang, "/catalogue", m.title, m.description);
}

export default function PublicCatalogHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <CatalogHub basePath="/catalogue" />
    </div>
  );
}
