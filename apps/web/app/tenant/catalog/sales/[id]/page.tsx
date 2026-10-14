"use client";

import { useParams } from "next/navigation";
import { SaleListingDetail } from "@/components/catalog/sale-listing-detail";

export default function TenantCatalogSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <SaleListingDetail id={id} basePath="/tenant/catalog/sales" />;
}
