"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";

interface LeaseRow {
  id: string;
  contractNumber: string;
  property: { name: string };
  tenant: { fullName: string };
  rentAmount: number;
  status: any;
  documentUrl?: string | null;
}

export default function OwnerLeasesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["leases", "mine", page],
    queryFn: async () => (await api.get("/leases", { params: { page, limit: 10 } })).data,
  });

  const columns: Column<LeaseRow>[] = [
    { header: "N° Contrat", cell: (r) => <span className="font-mono text-xs">{r.contractNumber}</span> },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Loyer", cell: (r) => formatXOF(r.rentAmount) },
    { header: "Statut", cell: (r) => <LeaseStatusBadge status={r.status} /> },
    {
      header: "Document",
      cell: (r) =>
        r.documentUrl ? (
          <a href={fileUrl(r.documentUrl)} target="_blank" className="text-primary hover:underline">
            <Download className="h-4 w-4" />
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Contrats" subtitle="Contrats de bail liés à vos biens" />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={FileText} title="Aucun contrat pour le moment" />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} page={page} limit={10} total={data?.total} onPageChange={setPage} />
      )}
    </div>
  );
}
