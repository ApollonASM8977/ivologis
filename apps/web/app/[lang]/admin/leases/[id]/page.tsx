"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LeaseDetail } from "@/components/leases/lease-detail";
import { LeaseOperations } from "@/components/leases/lease-operations";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export default function AdminLeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lease, isLoading, isError } = useQuery({
    queryKey: ["leases", "detail", id],
    queryFn: async () => (await api.get(`/leases/${id}`)).data,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !lease) return <EmptyState icon={FileText} title="Contrat introuvable" />;
  return (
    <>
      <LeaseDetail lease={lease} backHref="/admin/leases" />
      <LeaseOperations lease={lease} />
    </>
  );
}
