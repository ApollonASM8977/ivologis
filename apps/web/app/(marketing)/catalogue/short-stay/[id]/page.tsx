"use client";

import { useParams } from "next/navigation";
import { ShortStayListingDetail } from "@/components/catalog/short-stay-listing-detail";

export default function PublicCatalogShortStayDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <ShortStayListingDetail id={id} basePath="/catalogue/short-stay" />
    </div>
  );
}
