"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export interface TenantFormValues {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  profession?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  password?: string;
}

export function TenantForm({
  defaultValues,
  loading,
  onSubmit,
  submitLabel = "Enregistrer",
}: {
  defaultValues?: Partial<TenantFormValues>;
  loading?: boolean;
  onSubmit: (values: TenantFormValues) => void;
  submitLabel?: string;
}) {
  const { register, handleSubmit } = useForm<TenantFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Nom complet</Label>
          <Input {...register("fullName", { required: true })} />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
        </div>
        <div className="col-span-2">
          <Label>Adresse actuelle</Label>
          <Input {...register("address")} />
        </div>
        <div>
          <Label>Profession</Label>
          <Input {...register("profession")} />
        </div>
        <div>
          <Label>Mot de passe (optionnel)</Label>
          <Input type="password" {...register("password")} />
        </div>
        <div>
          <Label>Contact d&apos;urgence — Nom</Label>
          <Input {...register("emergencyContactName")} />
        </div>
        <div>
          <Label>Contact d&apos;urgence — Téléphone</Label>
          <Input {...register("emergencyContactPhone")} />
        </div>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
