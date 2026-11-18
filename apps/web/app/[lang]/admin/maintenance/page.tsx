"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { MAINTENANCE_ISSUE_LABELS, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";

interface MaintenanceRow {
  id: string;
  description: string;
  issueType: string;
  priority: string;
  status: any;
  createdAt: string;
  tenant: { fullName: string };
  property: { name: string };
}

export default function AdminMaintenancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance", page, status],
    queryFn: async () => (await api.get("/maintenance", { params: { page, limit: 10, status: status || undefined } })).data,
  });

  const columns: Column<MaintenanceRow>[] = [
    { header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString("fr-FR") },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Type", cell: (r) => MAINTENANCE_ISSUE_LABELS[r.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS] },
    { header: "Priorité", cell: (r) => MAINTENANCE_PRIORITY_LABELS[r.priority as keyof typeof MAINTENANCE_PRIORITY_LABELS] },
    { header: "Statut", cell: (r) => <MaintenanceStatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Demandes de réparation et suivi des interventions" />

      <div className="mb-4">
        <Select className="w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="RECU">Reçu</option>
          <option value="EN_COURS">En cours</option>
          <option value="RESOLU">Résolu</option>
          <option value="REJETE">Rejeté</option>
        </Select>
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wrench} title="Aucune demande de maintenance" />
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
          onRowClick={(row) => router.push(`/admin/maintenance/${row.id}`)}
        />
      )}
    </div>
  );
}
