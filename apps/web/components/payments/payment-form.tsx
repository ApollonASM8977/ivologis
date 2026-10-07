"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PaymentMethod } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PaymentMethodPicker } from "@/components/payment-method-picker";

export interface PaymentFormValues {
  tenantId: string;
  propertyId: string;
  amount: number;
  periodMonth: string;
  paymentDate?: string;
  method: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export function PaymentForm({ loading, onSubmit }: { loading?: boolean; onSubmit: (v: PaymentFormValues) => void }) {
  const { register, handleSubmit, setValue, watch } = useForm<PaymentFormValues>({
    defaultValues: { periodMonth: new Date().toISOString().slice(0, 10), method: PaymentMethod.CASH },
  });
  const selectedMethod = watch("method");

  const { data: tenants } = useQuery({
    queryKey: ["tenants", "all-for-select"],
    queryFn: async () => (await api.get("/tenants", { params: { limit: 100 } })).data,
  });

  function onTenantChange(tenantId: string) {
    const tenant = tenants?.data?.find((t: any) => t.id === tenantId);
    const property = tenant?.currentProperties?.[0];
    if (property) {
      setValue("propertyId", property.id);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Locataire</Label>
        <Select {...register("tenantId", { required: true, onChange: (e) => onTenantChange(e.target.value) })}>
          <option value="">Sélectionner...</option>
          {tenants?.data?.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.fullName} {t.currentProperties?.[0] ? `· ${t.currentProperties[0].name}` : ""}
            </option>
          ))}
        </Select>
        <input type="hidden" {...register("propertyId", { required: true })} />
      </div>

      <div>
        <Label>Moyen de paiement</Label>
        <input type="hidden" {...register("method", { required: true })} />
        <PaymentMethodPicker value={selectedMethod} onChange={(m) => setValue("method", m)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Montant (FCFA)</Label>
          <Input type="number" {...register("amount", { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <Label>Mois concerné</Label>
          <Input type="date" {...register("periodMonth", { required: true })} />
        </div>
        <div className="col-span-2">
          <Label>Référence transaction</Label>
          <Input {...register("transactionRef")} />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea rows={2} {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Enregistrer le paiement
      </Button>
    </form>
  );
}
