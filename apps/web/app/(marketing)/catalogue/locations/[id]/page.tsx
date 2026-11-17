"use client";

import { useParams } from "next/navigation";
import { RentalListingDetail } from "@/components/catalog/rental-listing-detail";

export default function PublicCatalogRentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <RentalListingDetail id={id} basePath="/catalogue/locations" />
    </div>
  );
}
