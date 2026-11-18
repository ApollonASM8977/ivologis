"use client";

import { useParams } from "next/navigation";
import { TenantDetail } from "@/components/tenants/tenant-detail";

export default function OwnerTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <TenantDetail id={id} />;
}
