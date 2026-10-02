"use client";

import { useParams } from "next/navigation";
import { PropertyDetail } from "@/components/properties/property-detail";

export default function AdminPropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <PropertyDetail id={id} listHref="/admin/properties" />;
}
