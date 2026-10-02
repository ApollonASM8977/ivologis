"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Wallet, Download, Receipt, AlertTriangle } from "lucide-react";
import { api, apiErrorMessage, fileUrl, API_URL } from "@/lib/api";
import { formatXOF, PAYMENT_METHOD_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge } from "@/components/status-badges";
import { PaymentForm, PaymentFormValues } from "@/components/payments/payment-form";

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

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", page, status],
    queryFn: async () => (await api.get("/payments", { params: { page, limit: 10, status: status || undefined } })).data,
  });

  const { data: overdue } = useQuery({
    queryKey: ["payments", "overdue"],
    queryFn: async () => (await api.get("/payments/overdue")).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: PaymentFormValues) => api.post("/payments", values),
    onSuccess: () => {
      toast.success("Paiement enregistré et quittance générée.");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<PaymentRow>[] = [
    { header: "Date", cell: (r) => new Date(r.paymentDate).toLocaleDateString("fr-FR") },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Montant", cell: (r) => formatXOF(r.amount) },
    { header: "Moyen", cell: (r) => PAYMENT_METHOD_LABELS[r.method as keyof typeof PAYMENT_METHOD_LABELS] },
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
        title="Paiements"
        subtitle="Suivi des loyers et transactions"
        action={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Enregistrer un paiement
            </Button>
            <a href={`${API_URL}/api/payments/export`} target="_blank">
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4" /> Exporter CSV
              </Button>
            </a>
          </div>
        }
      />

      {!!overdue?.length && (
        <Card className="mb-4 border-red-100 bg-red-50/50">
          <div className="flex items-center gap-2 text-sm font-medium text-danger">
            <AlertTriangle className="h-4 w-4" /> {overdue.length} loyer(s) en retard ce mois-ci
          </div>
          <div className="mt-2 space-y-1 text-sm text-ink">
            {overdue.slice(0, 5).map((o: any) => (
              <div key={o.leaseId} className="flex justify-between">
                <span>{o.tenant.fullName} — {o.property.name}</span>
                <span className="font-medium">{formatXOF(o.rentAmount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-4 flex gap-3">
        <Select className="w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="PAID">Payé</option>
          <option value="PENDING">En attente</option>
          <option value="LATE">En retard</option>
          <option value="CANCELLED">Annulé</option>
        </Select>
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wallet} title="Aucun paiement" action={<Button onClick={() => setModalOpen(true)}>Enregistrer un paiement</Button>} />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} page={page} limit={10} total={data?.total} onPageChange={setPage} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enregistrer un paiement">
        <PaymentForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>
    </div>
  );
}
