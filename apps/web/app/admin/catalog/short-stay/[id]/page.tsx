"use client";

import { useParams } from "next/navigation";
import { ShortStayListingDetail } from "@/components/catalog/short-stay-listing-detail";

export default function AdminCatalogShortStayDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ShortStayListingDetail id={id} />;
}
