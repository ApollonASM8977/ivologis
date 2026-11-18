import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { catalogMeta } from "@/messages/catalog-meta";
import { CatalogHub } from "@/components/catalog/catalog-hub";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const m = catalogMeta[toLang((await params).lang)].hub;
  return { title: m.title, description: m.description };
}

export default function PublicCatalogHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <CatalogHub basePath="/catalogue" />
    </div>
  );
}
