import type { Metadata } from "next";
import { RentalListingDetail } from "@/components/catalog/rental-listing-detail";
import { fetchListing, listingMetadata, ListingJsonLd } from "@/lib/listing-seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await fetchListing("rentals", (await params).id);
  return p ? listingMetadata("rentals", p) : { title: "Logement à louer" };
}

export default async function PublicCatalogRentalDetailPage({ params }: Props) {
  const { id } = await params;
  const p = await fetchListing("rentals", id);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {p && <ListingJsonLd kind="rentals" p={p} />}
      <RentalListingDetail id={id} basePath="/catalogue/locations" />
    </div>
  );
}
