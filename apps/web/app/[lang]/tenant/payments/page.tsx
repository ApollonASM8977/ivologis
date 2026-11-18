"use client";

import { DocumentLink } from "@/components/document-link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Receipt, Wallet } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { PaymentMethod } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge } from "@/components/status-badges";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { t } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";
import { invalidForm } from "@/lib/form";

interface PayForm {
  method: PaymentMethod;
  transactionRef: string;
}

export default function TenantPaymentsPage() {
  const queryClient = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });
  const property = properties?.[0];
  const lease = property?.leases?.[0];
  // Le loyer du bail fait foi : une révision le modifie sans toucher la fiche du bien.
  const rent = Number(lease?.rentAmount ?? property?.rentAmount ?? 0);
  const monthLabel = new Date().toLocaleDateString(locale(), { month: "long", year: "numeric" });

  const { data, isLoading } = useQuery({
    queryKey: ["payments", "mine"],
    queryFn: async () => (await api.get("/payments", { params: { limit: 20 } })).data,
  });
  const now = new Date();
  const thisMonth = (data?.data ?? []).find((p: any) => {
    const d = new Date(p.periodMonth);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && (p.status === "PAID" || p.status === "PENDING");
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<PayForm>({
    defaultValues: { method: PaymentMethod.ORANGE_MONEY },
  });
  const selectedMethod = watch("method");

  const payMutation = useMutation({
    mutationFn: (values: PayForm) => api.post("/payments/pay-rent", values),
    onSuccess: () => {
      toast.success(t("Paiement déclaré. Votre quittance sera disponible dès que l'agence aura vérifié la transaction."));
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setPayOpen(false);
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<any>[] = [
    { header: "Date", cell: (r: any) => new Date(r.paymentDate).toLocaleDateString(locale()) },
    { header: "Mois", cell: (r: any) => new Date(r.periodMonth).toLocaleDateString(locale(), { month: "long", year: "numeric" }) },
    { header: "Montant", cell: (r: any) => money(r.amount) },
    { header: "Moyen", cell: (r: any) => <PaymentMethodBadge method={r.method as PaymentMethod} size="sm" /> },
    {
      header: "Statut",
      cell: (r: any) => (
        <div>
          <PaymentStatusBadge status={r.status} />
          {r.status === "CANCELLED" && r.notes && <p className="mt-1 max-w-[16rem] text-xs text-danger">{r.notes}</p>}
        </div>
      ),
    },
    {
      header: "Quittance",
      cell: (r: any) =>
        r.receipt?.pdfUrl ? (
          <DocumentLink path={r.receipt.pdfUrl} className="text-primary hover:underline" aria-label={t("Télécharger la quittance")}>
            <Receipt className="h-4 w-4" />
          </DocumentLink>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("Mes paiements")}
        subtitle={t("Historique de vos loyers et quittances")}
        action={
          lease && !thisMonth && (
            <Button size="sm" onClick={() => setPayOpen(true)}>
              <CreditCard className="h-4 w-4" />{" "}{t("Déclarer un paiement")}
            </Button>
          )
        }
      />

      {thisMonth && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${thisMonth.status === "PAID" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-700"}`}>
          {thisMonth.status === "PAID"
            ? t("Loyer de {0} réglé. Merci !", monthLabel)
            : t("Paiement de {0} déclaré : l'agence vérifie la transaction (réf. {1}).", monthLabel, thisMonth.transactionRef ?? "-")}
        </div>
      )}

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wallet} title={t("Aucun paiement pour le moment")} />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} />
      )}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title={t("Déclarer le paiement de mon loyer")}>
        <form onSubmit={handleSubmit((v) => payMutation.mutate(v), invalidForm)} className="space-y-4">
          <div className="rounded-xl bg-primary/5 px-4 py-3">
            <p className="text-xs text-ink-muted">{t("{0} · loyer de {1}", property?.name, monthLabel)}</p>
            <p className="text-lg font-semibold text-primary">{money(rent)}</p>
          </div>
          <div>
            <Label>{t("Moyen utilisé")}</Label>
            <input type="hidden" {...register("method", { required: true })} />
            <PaymentMethodPicker value={selectedMethod} onChange={(m) => setValue("method", m)} />
          </div>
          <div>
            <Label htmlFor="tx-ref">{t("Référence de la transaction")}</Label>
            <Input
              id="tx-ref"
              autoComplete="off"
              placeholder="Ex : MP261117.1432.A12345"
              {...register("transactionRef", { required: true, minLength: 4 })}
            />
            <p className="mt-1 text-xs text-ink-muted">{t("Elle figure dans le SMS ou la notification de confirmation de votre opérateur.")}</p>
          </div>
          <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">
            {t("Payez d'abord depuis votre téléphone au numéro indiqué par votre agence, puis déclarez-le ici. L'agence vérifie la transaction : la quittance est émise seulement après cette vérification.")}
          </p>
          <Button type="submit" className="w-full" loading={payMutation.isPending}>
            {t("Envoyer la déclaration")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
