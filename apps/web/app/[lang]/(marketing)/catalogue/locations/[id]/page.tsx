import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toLang } from "@/lib/i18n";
import { catalogMeta } from "@/messages/catalog-meta";
import { RentalListingDetail } from "@/components/catalog/rental-listing-detail";
import { fetchListing, listingMetadata, ListingJsonLd } from "@/lib/listing-seo";

type Props = { params: Promise<{ id: string; lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lang } = await params;
  const p = await fetchListing("rentals", id);
  return p ? listingMetadata("rentals", p, toLang(lang)) : { title: catalogMeta[toLang(lang)].rentals.fallback };
}

export default async function PublicCatalogRentalDetailPage({ params }: Props) {
  const { id } = await params;
  const p = await fetchListing("rentals", id);
  if (p === false) notFound();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {p && <ListingJsonLd kind="rentals" p={p} />}
      <RentalListingDetail id={id} basePath="/catalogue/locations" initial={p} />
    </div>
  );
}
