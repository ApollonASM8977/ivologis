"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export interface LeaseFormValues {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  advance: number;
  specialConditions?: string;
}

export function LeaseForm({ loading, onSubmit }: { loading?: boolean; onSubmit: (v: LeaseFormValues) => void }) {
  const { register, handleSubmit, watch, setValue } = useForm<LeaseFormValues>();

  const { data: properties } = useQuery({
    queryKey: ["properties", "vacant-for-select"],
    queryFn: async () => (await api.get("/properties", { params: { status: "VACANT", limit: 100 } })).data,
  });
  const { data: tenants } = useQuery({
    queryKey: ["tenants", "all-for-select"],
    queryFn: async () => (await api.get("/tenants", { params: { limit: 100 } })).data,
  });

  function onPropertyChange(id: string) {
    const property = properties?.data?.find((p: any) => p.id === id);
    if (property) {
      setValue("rentAmount", Number(property.rentAmount));
      setValue("deposit", Number(property.deposit));
      setValue("advance", Number(property.advance));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Bien (vacant uniquement)</Label>
        <Select {...register("propertyId", { required: true, onChange: (e) => onPropertyChange(e.target.value) })}>
          <option value="">Sélectionner...</option>
          {properties?.data?.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.commune}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Locataire</Label>
        <Select {...register("tenantId", { required: true })}>
          <option value="">Sélectionner...</option>
          {tenants?.data?.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date de début</Label>
          <Input type="date" {...register("startDate", { required: true })} />
        </div>
        <div>
          <Label>Date de fin</Label>
          <Input type="date" {...register("endDate", { required: true })} />
        </div>
        <div>
          <Label>Loyer (FCFA)</Label>
          <Input type="number" {...register("rentAmount", { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <Label>Caution (FCFA)</Label>
          <Input type="number" {...register("deposit", { required: true, valueAsNumber: true })} />
        </div>
        <div className="col-span-2">
          <Label>Avance (FCFA)</Label>
          <Input type="number" {...register("advance", { required: true, valueAsNumber: true })} />
        </div>
      </div>
      <div>
        <Label>Conditions particulières</Label>
        <Textarea rows={2} {...register("specialConditions")} />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Créer le contrat
      </Button>
    </form>
  );
}
