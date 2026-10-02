"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { MAINTENANCE_ISSUE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";

interface MaintenanceRow {
  id: string;
  description: string;
  issueType: string;
  status: any;
  createdAt: string;
  tenant: { fullName: string };
  property: { name: string };
}

export default function OwnerMaintenancePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance", "mine", page],
    queryFn: async () => (await api.get("/maintenance", { params: { page, limit: 10 } })).data,
  });

  const columns: Column<MaintenanceRow>[] = [
    { header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString("fr-FR") },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Type", cell: (r) => MAINTENANCE_ISSUE_LABELS[r.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS] },
    { header: "Statut", cell: (r) => <MaintenanceStatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Demandes concernant vos biens" />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wrench} title="Aucune demande de maintenance" />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} page={page} limit={10} total={data?.total} onPageChange={setPage} />
      )}
    </div>
  );
}
