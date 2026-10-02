"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export interface OwnerFormValues {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  password?: string;
}

export function OwnerForm({
  defaultValues,
  loading,
  onSubmit,
  submitLabel = "Enregistrer",
  showPassword = true,
}: {
  defaultValues?: Partial<OwnerFormValues>;
  loading?: boolean;
  onSubmit: (values: OwnerFormValues) => void;
  submitLabel?: string;
  showPassword?: boolean;
}) {
  const { register, handleSubmit } = useForm<OwnerFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nom complet</Label>
        <Input placeholder="Ex : Kouadio Jean" {...register("fullName", { required: true })} />
      </div>
      <div>
        <Label>Téléphone</Label>
        <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
      </div>
      <div>
        <Label>Adresse</Label>
        <Input {...register("address")} />
      </div>
      {showPassword && (
        <div>
          <Label>Mot de passe (optionnel — crée un accès de connexion)</Label>
          <Input type="password" placeholder="Laisser vide si aucun accès" {...register("password")} />
        </div>
      )}
      <Button type="submit" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
