"use client";

import { useParams } from "next/navigation";
import { RentalListingDetail } from "@/components/catalog/rental-listing-detail";

export default function TenantCatalogRentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <RentalListingDetail id={id} basePath="/tenant/catalog/locations" />;
}
