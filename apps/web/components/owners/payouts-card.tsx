"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "motion/react";
import { HandCoins, Plus } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatXOF, PAYMENT_METHOD_LABELS, PaymentMethod } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CountUp } from "@/components/dashboard/count-up";

interface Balance {
  gross: number;
  commissionRate: number;
  commission: number;
  maintenanceCosts: number;
  paidOut: number;
  balanceDue: number;
}

interface PayoutForm {
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes: string;
  paidAt: string;
}

export function PayoutsCard({ ownerId, canRecord }: { ownerId: string; canRecord: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: balance } = useQuery<Balance>({
    queryKey: ["owners", ownerId, "balance"],
    queryFn: async () => (await api.get(`/owners/${ownerId}/balance`)).data,
    enabled: !!ownerId,
  });
  const { data: payouts } = useQuery<any[]>({
    queryKey: ["owners", ownerId, "payouts"],
    queryFn: async () => (await api.get(`/owners/${ownerId}/payouts`)).data,
    enabled: !!ownerId,
  });

  const form = useForm<PayoutForm>({
    defaultValues: { amount: 0, method: PaymentMethod.BANK_TRANSFER, reference: "", notes: "", paidAt: new Date().toISOString().slice(0, 10) },
  });

  const record = useMutation({
    mutationFn: (values: PayoutForm) =>
      api.post(`/owners/${ownerId}/payouts`, {
        amount: Number(values.amount),
        method: values.method,
        reference: values.reference || undefined,
        notes: values.notes || undefined,
        paidAt: values.paidAt ? new Date(values.paidAt).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success("Versement enregistré.");
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["owners", ownerId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Card>
      <CardHeader
        title="Versements au propriétaire"
        subtitle="Encaissements, commission, travaux et versements effectués"
        action={
          canRecord ? (
            <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
              <Plus className="h-4 w-4" /> Enregistrer un versement
            </Button>
          ) : undefined
        }
      />

      {balance && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Encaissé", value: balance.gross },
            { label: `Commission (${balance.commissionRate} %)`, value: balance.commission },
            { label: "Travaux", value: balance.maintenanceCosts },
            { label: "Déjà versé", value: balance.paidOut },
          ].map((k) => (
            <div key={k.label} className="rounded-xl bg-surface p-3">
              <p className="text-xs text-ink-muted">{k.label}</p>
              <p className="mt-1 font-semibold text-ink"><CountUp value={k.value} format={(n) => formatXOF(n)} /></p>
            </div>
          ))}
        </div>
      )}
      {balance && (
        <div className={`mb-5 flex items-center justify-between rounded-xl px-4 py-3 ${balance.balanceDue > 0 ? "bg-primary/5" : "bg-gray-50"}`}>
          <span className="flex items-center gap-2 text-sm font-medium text-ink"><HandCoins className="h-4 w-4 text-primary" /> Solde à verser</span>
          <span className="text-lg font-bold text-primary-dark"><CountUp value={balance.balanceDue} format={(n) => formatXOF(n)} /></span>
        </div>
      )}

      {open && canRecord && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={form.handleSubmit((v) => record.mutate(v))}
          className="mb-5 grid gap-3 overflow-hidden rounded-xl bg-surface p-4 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="po-amount">Montant (FCFA)</Label>
            <Input id="po-amount" type="number" min={1} {...form.register("amount", { required: true, valueAsNumber: true, min: 1 })} />
          </div>
          <div>
            <Label htmlFor="po-method">Moyen</Label>
            <Select id="po-method" {...form.register("method")}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="po-ref">Référence (optionnel)</Label>
            <Input id="po-ref" placeholder="N° de virement" {...form.register("reference", { maxLength: 80 })} />
          </div>
          <div>
            <Label htmlFor="po-date">Date du versement</Label>
            <Input id="po-date" type="date" {...form.register("paidAt", { required: true })} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={record.isPending}>Valider le versement</Button>
          </div>
        </motion.form>
      )}

      {payouts?.length ? (
        <ul className="divide-y divide-gray-100 text-sm">
          {payouts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div>
                <p className="font-medium text-ink">{formatXOF(Number(p.amount))}</p>
                <p className="text-xs text-ink-muted">
                  {new Date(p.paidAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })} · {PAYMENT_METHOD_LABELS[p.method as PaymentMethod]}
                  {p.reference ? ` · réf. ${p.reference}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Aucun versement enregistré pour le moment.</p>
      )}
    </Card>
  );
}
