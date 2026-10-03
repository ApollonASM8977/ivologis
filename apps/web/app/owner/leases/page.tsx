"use client";

import Link from "next/link";
import { DocumentLink } from "@/components/document-link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, FileType } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { formatXOF, LEASE_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";

interface LeaseRow {
  id: string;
  contractNumber: string;
  type: keyof typeof LEASE_TYPE_LABELS;
  property: { name: string };
  tenant: { fullName: string };
  rentAmount: number;
  status: any;
  documentUrl?: string | null;
  wordUrl?: string | null;
}

export default function OwnerLeasesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["leases", "mine", page],
    queryFn: async () => (await api.get("/leases", { params: { page, limit: 10 } })).data,
  });

  const columns: Column<LeaseRow>[] = [
    { header: "N° Contrat", cell: (r) => <Link href={`/owner/leases/${r.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">{r.contractNumber}</Link> },
    { header: "Type", cell: (r) => <Badge color="blue">{LEASE_TYPE_LABELS[r.type]}</Badge> },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Loyer", cell: (r) => formatXOF(r.rentAmount) },
    { header: "Statut", cell: (r) => <LeaseStatusBadge status={r.status} /> },
    {
      header: "Document",
      cell: (r) => (
        <div className="flex gap-2">
          {r.documentUrl && (
            <DocumentLink path={r.documentUrl} className="flex items-center gap-1 text-primary hover:underline" title="PDF">
              <Download className="h-4 w-4" /> PDF
            </DocumentLink>
          )}
          {r.wordUrl && (
            <DocumentLink path={r.wordUrl} className="flex items-center gap-1 text-primary hover:underline" title="Word">
              <FileType className="h-4 w-4" /> Word
            </DocumentLink>
          )}
          {!r.documentUrl && !r.wordUrl && "—"}
        </div>
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
