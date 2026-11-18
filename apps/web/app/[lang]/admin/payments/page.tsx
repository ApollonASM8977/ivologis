"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Wallet, Download, Receipt, AlertTriangle, FileDown } from "lucide-react";
import { api, apiErrorMessage, downloadFile, openDocument } from "@/lib/api";
import { PaymentMethod } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge } from "@/components/status-badges";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentForm, PaymentFormValues } from "@/components/payments/payment-form";
import { t } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";

interface PaymentRow {
  id: string;
  tenant: { fullName: string };
  property: { name: string };
  amount: number;
  method: string;
  status: any;
  paymentDate: string;
  transactionRef?: string | null;
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
      toast.success(t("Paiement enregistré et quittance générée."));
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const receiptMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payments/${id}/receipt`),
    onSuccess: (res) => {
      toast.success(t("Quittance générée."));
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      openDocument(res.data.pdfUrl).catch((e) => toast.error(apiErrorMessage(e)));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "confirm" | "reject" }) => api.post(`/payments/${id}/${decision}`, {}),
    onSuccess: (_res, { decision }) => {
      toast.success(decision === "confirm" ? t("Paiement confirmé, quittance émise.") : t("Déclaration refusée, le locataire est prévenu."));
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<PaymentRow>[] = [
    { header: "Date", cell: (r) => new Date(r.paymentDate).toLocaleDateString(locale()) },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Montant", cell: (r) => money(r.amount) },
    { header: "Moyen", cell: (r) => <PaymentMethodBadge method={r.method as PaymentMethod} size="sm" /> },
    { header: t("Référence"), cell: (r) => <span className="font-mono text-xs">{r.transactionRef ?? "-"}</span> },
    { header: "Statut", cell: (r) => <PaymentStatusBadge status={r.status} /> },
    {
      header: "Quittance",
      cell: (r) =>
        r.status === "PENDING" ? (
          <div className="flex gap-1">
            <button
              onClick={() => decisionMutation.mutate({ id: r.id, decision: "confirm" })}
              disabled={decisionMutation.isPending}
              className="rounded px-1.5 py-1 text-xs font-semibold text-success hover:bg-success/10 disabled:opacity-50"
            >
              {t("Confirmer")}
            </button>
            <button
              onClick={() => decisionMutation.mutate({ id: r.id, decision: "reject" })}
              disabled={decisionMutation.isPending}
              className="rounded px-1.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              {t("Refuser")}
            </button>
          </div>
        ) : r.status !== "PAID" ? (
          "-"
        ) : (
        <button
          title={t("Générer la quittance PDF")}
          onClick={() => receiptMutation.mutate(r.id)}
          disabled={receiptMutation.isPending}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-ink-muted hover:bg-gray-100 hover:text-primary disabled:opacity-50"
        >
          {r.receipt?.pdfUrl ? <Receipt className="h-3.5 w-3.5" /> : <FileDown className="h-3.5 w-3.5" />}
          {t("PDF")}
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("Paiements")}
        subtitle={t("Suivi des loyers et transactions")}
        action={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />{" "}{t("Enregistrer un paiement")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => downloadFile("/payments/export", "paiements.csv").catch((e) => toast.error(apiErrorMessage(e)))}>
              <Download className="h-4 w-4" />{" "}{t("Exporter CSV")}
            </Button>
          </div>
        }
      />

      {!!overdue?.length && (
        <Card className="mb-4 border-red-100 bg-red-50/50">
          <div className="flex items-center gap-2 text-sm font-medium text-danger">
            <AlertTriangle className="h-4 w-4" />{" "}{t("{0} loyer(s) en retard ce mois-ci", overdue.length)}
          </div>
          <div className="mt-2 space-y-1 text-sm text-ink">
            {overdue.slice(0, 5).map((o: any) => (
              <div key={o.leaseId} className="flex justify-between">
                <span>{o.tenant.fullName} · {o.property.name}</span>
                <span className="font-medium">{money(o.rentAmount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-4 flex gap-3">
        <Select className="w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t("Tous les statuts")}</option>
          <option value="PAID">{t("Payé")}</option>
          <option value="PENDING">{t("En attente")}</option>
          <option value="LATE">{t("En retard")}</option>
          <option value="CANCELLED">{t("Annulé")}</option>
        </Select>
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wallet} title={t("Aucun paiement")} action={<Button onClick={() => setModalOpen(true)}>{t("Enregistrer un paiement")}</Button>} />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} page={page} limit={10} total={data?.total} onPageChange={setPage} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("Enregistrer un paiement")}>
        <PaymentForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>
    </div>
  );
}
