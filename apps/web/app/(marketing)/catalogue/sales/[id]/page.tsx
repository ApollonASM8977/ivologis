"use client";

import { useParams } from "next/navigation";
import { SaleListingDetail } from "@/components/catalog/sale-listing-detail";

export default function PublicCatalogSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <SaleListingDetail id={id} basePath="/catalogue/sales" />
    </div>
  );
}
