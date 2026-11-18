import type { Metadata } from "next";
import { ShortStayListingDetail } from "@/components/catalog/short-stay-listing-detail";
import { fetchListing, listingMetadata, ListingJsonLd } from "@/lib/listing-seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await fetchListing("short-stay", (await params).id);
  return p ? listingMetadata("short-stay", p) : { title: "Résidence meublée" };
}

export default async function PublicCatalogShortStayDetailPage({ params }: Props) {
  const { id } = await params;
  const p = await fetchListing("short-stay", id);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {p && <ListingJsonLd kind="short-stay" p={p} />}
      <ShortStayListingDetail id={id} basePath="/catalogue/short-stay" initial={p} />
    </div>
  );
}
