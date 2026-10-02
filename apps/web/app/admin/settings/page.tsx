"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { PaymentMethod } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";
import { PaymentMethodBadge } from "@/components/payment-method-badge";

interface SettingsForm {
  companyName: string;
  address?: string;
  email?: string;
  phone?: string;
  commissionRate: number;
  enabledPaymentMethods: PaymentMethod[];
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get("/settings")).data,
  });

  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: SettingsForm) => api.patch("/settings", values),
    onSuccess: () => {
      toast.success("Paramètres mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Configuration générale de l'entreprise IVOLOGIS" />

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
        <Card>
          <CardHeader title="Informations de l'entreprise" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Nom de l&apos;entreprise</Label>
              <Input {...register("companyName", { required: true })} />
            </div>
            <div>
              <Label>Taux de commission (%)</Label>
              <Input type="number" step="0.1" {...register("commissionRate", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...register("phone")} />
            </div>
            <div className="sm:col-span-2">
              <Label>Adresse</Label>
              <Input {...register("address")} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Moyens de paiement activés" subtitle="Visibles par les locataires lors du paiement" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.values(PaymentMethod).map((method) => (
              <label key={method} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50">
                <input type="checkbox" value={method} className="h-4 w-4 rounded border-gray-300" {...register("enabledPaymentMethods")} />
                <PaymentMethodBadge method={method} size="sm" />
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" loading={updateMutation.isPending}>
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  );
}
