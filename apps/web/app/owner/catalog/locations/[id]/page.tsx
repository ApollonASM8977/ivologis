"use client";

import { useParams } from "next/navigation";
import { RentalListingDetail } from "@/components/catalog/rental-listing-detail";

export default function OwnerCatalogRentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <RentalListingDetail id={id} basePath="/owner/catalog/locations" />;
}
