"use client";

import { DocumentLink } from "@/components/document-link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Receipt, Wallet } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF, PaymentMethod } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge } from "@/components/status-badges";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentMethodPicker } from "@/components/payment-method-picker";

interface PayForm {
  method: PaymentMethod;
}

export default function TenantPaymentsPage() {
  const queryClient = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });
  const property = properties?.[0];

  const { data, isLoading } = useQuery({
    queryKey: ["payments", "mine"],
    queryFn: async () => (await api.get("/payments", { params: { limit: 20 } })).data,
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<PayForm>({
    defaultValues: { method: PaymentMethod.ORANGE_MONEY },
  });
  const selectedMethod = watch("method");

  const payMutation = useMutation({
    mutationFn: (values: PayForm) => api.post("/payments/pay-rent", { method: values.method }),
    onSuccess: () => {
      toast.success("Paiement confirmé ! Votre quittance est disponible.");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setPayOpen(false);
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<any>[] = [
    { header: "Date", cell: (r: any) => new Date(r.paymentDate).toLocaleDateString("fr-FR") },
    { header: "Mois", cell: (r: any) => new Date(r.periodMonth).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
    { header: "Montant", cell: (r: any) => formatXOF(r.amount) },
    { header: "Moyen", cell: (r: any) => <PaymentMethodBadge method={r.method as PaymentMethod} size="sm" /> },
    { header: "Statut", cell: (r: any) => <PaymentStatusBadge status={r.status} /> },
    {
      header: "Quittance",
      cell: (r: any) =>
        r.receipt?.pdfUrl ? (
          <DocumentLink path={r.receipt.pdfUrl} className="text-primary hover:underline">
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
        title="Mes paiements"
        subtitle="Historique de vos loyers et quittances"
        action={
          property && (
            <Button size="sm" onClick={() => setPayOpen(true)}>
              <CreditCard className="h-4 w-4" /> Payer maintenant
            </Button>
          )
        }
      />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Wallet} title="Aucun paiement pour le moment" />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} />
      )}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Payer mon loyer">
        <Card className="mb-4 bg-primary/5">
          <p className="text-sm text-ink-muted">Bien concerné</p>
          <p className="font-semibold text-ink">{property?.name}</p>
          <p className="mt-2 text-sm text-ink-muted">Loyer mensuel</p>
          <p className="font-semibold text-primary">{formatXOF(property?.rentAmount ?? 0)}</p>
        </Card>
        <form onSubmit={handleSubmit((v) => payMutation.mutate(v))} className="space-y-4">
          <div className="rounded-xl bg-primary/5 px-4 py-3">
            <p className="text-xs text-ink-muted">Montant du loyer du mois</p>
            <p className="text-lg font-semibold text-primary">{formatXOF(property?.rentAmount ?? 0)}</p>
          </div>
          <div>
            <Label>Moyen de paiement</Label>
            <input type="hidden" {...register("method", { required: true })} />
            <PaymentMethodPicker value={selectedMethod} onChange={(m) => setValue("method", m)} />
          </div>
          <p className="text-xs text-ink-muted">
            L'intégration Mobile Money réelle arrive bientôt. Ce paiement est simulé pour la démonstration.
          </p>
          <Button type="submit" className="w-full" loading={payMutation.isPending}>
            Confirmer le paiement
          </Button>
        </form>
      </Modal>
    </div>
  );
}
