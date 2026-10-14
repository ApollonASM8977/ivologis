"use client";

import { useParams } from "next/navigation";
import { SaleListingDetail } from "@/components/catalog/sale-listing-detail";

export default function OwnerCatalogSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <SaleListingDetail id={id} basePath="/owner/catalog/sales" />;
}
