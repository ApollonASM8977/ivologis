import type { Metadata } from "next";
import { SaleListingDetail } from "@/components/catalog/sale-listing-detail";
import { fetchListing, listingMetadata, ListingJsonLd } from "@/lib/listing-seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await fetchListing("sales", (await params).id);
  return p ? listingMetadata("sales", p) : { title: "Bien à vendre" };
}

export default async function PublicCatalogSaleDetailPage({ params }: Props) {
  const { id } = await params;
  const p = await fetchListing("sales", id);
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {p && <ListingJsonLd kind="sales" p={p} />}
      <SaleListingDetail id={id} basePath="/catalogue/sales" initial={p} />
    </div>
  );
}
