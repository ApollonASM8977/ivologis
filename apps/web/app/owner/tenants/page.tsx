"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";

interface TenantRow {
  id: string;
  fullName: string;
  phone: string;
  currentProperties: { name: string }[];
  leases: { status: any }[];
}

export default function OwnerTenantsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", "mine", page],
    queryFn: async () => (await api.get("/tenants", { params: { page, limit: 10 } })).data,
  });

  const columns: Column<TenantRow>[] = [
    { header: "Nom", cell: (r) => <span className="font-medium text-ink">{r.fullName}</span> },
    { header: "Téléphone", cell: (r) => r.phone },
    { header: "Logement", cell: (r) => r.currentProperties?.[0]?.name ?? "—" },
    { header: "Contrat", cell: (r) => (r.leases?.[0] ? <LeaseStatusBadge status={r.leases[0].status} /> : "—") },
  ];

  return (
    <div>
      <PageHeader title="Mes locataires" subtitle="Locataires occupant vos biens" />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={UserRound} title="Aucun locataire pour le moment" />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          loading={isLoading}
          rowKey={(r) => r.id}
          page={page}
          limit={10}
          total={data?.total}
          onPageChange={setPage}
          onRowClick={(row) => router.push(`/owner/tenants/${row.id}`)}
        />
      )}
    </div>
  );
}
