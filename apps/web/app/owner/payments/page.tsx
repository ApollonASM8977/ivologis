"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Receipt, Download } from "lucide-react";
import { api, fileUrl, API_URL } from "@/lib/api";
import { formatXOF, PaymentMethod } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge } from "@/components/status-badges";
import { PaymentMethodBadge } from "@/components/payment-method-badge";

interface PaymentRow {
  id: string;
  tenant: { fullName: string };
  property: { name: string };
  amount: number;
  method: string;
  status: any;
  paymentDate: string;
  receipt?: { pdfUrl?: string } | null;
}

export default function OwnerPaymentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", "mine", page],
    queryFn: async () => (await api.get("/payments", { params: { page, limit: 10 } })).data,
  });

  const columns: Column<PaymentRow>[] = [
    { header: "Date", cell: (r) => new Date(r.paymentDate).toLocaleDateString("fr-FR") },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Montant", cell: (r) => formatXOF(r.amount) },
    { header: "Moyen", cell: (r) => <PaymentMethodBadge method={r.method as PaymentMethod} size="sm" /> },
    { header: "Statut", cell: (r) => <PaymentStatusBadge status={r.status} /> },
    {
      header: "Quittance",
      cell: (r) =>
        r.receipt?.pdfUrl ? (
          <a href={fileUrl(r.receipt.pdfUrl)} target="_blank" className="text-primary hover:underline">
            <Receipt className="h-4 w-4" />
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Paiements de mes biens"
        subtitle="Historique des loyers perçus"
        action={
          <a href={`${API_URL}/api/payments/export`} target="_blank">
            <Button size="sm" variant="secondary">
              <Download className="h-4 w-4" /> Exporter CSV
            </Button>
          </a>
        }
      />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wallet} title="Aucun paiement pour le moment" />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} page={page} limit={10} total={data?.total} onPageChange={setPage} />
      )}
    </div>
  );
}
