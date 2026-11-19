import { Suspense } from "react";
import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import { catalogMeta } from "@/messages/catalog-meta";
import { TrackRequest } from "@/components/catalog/track-request";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = catalogMeta[lang].track;
  // Formulaire personnel : rien à indexer.
  return { ...pageMetadata(lang, "/catalogue/suivi", m.title, m.description), robots: { index: false, follow: true } };
}

export default function TrackRequestPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Suspense fallback={null}>
        <TrackRequest />
      </Suspense>
    </div>
  );
}
