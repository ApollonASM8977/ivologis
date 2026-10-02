"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { PropertyType, PROPERTY_TYPE_LABELS, COMMUNES_ABIDJAN } from "@ivologis/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export interface PropertyFormValues {
  name: string;
  type: PropertyType;
  description?: string;
  address: string;
  commune: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  surfaceM2?: number;
  rentAmount: number;
  deposit?: number;
  advance?: number;
  ownerId?: string;
}

export function PropertyForm({
  defaultValues,
  showOwnerField,
  loading,
  onSubmit,
  submitLabel = "Enregistrer",
}: {
  defaultValues?: Partial<PropertyFormValues>;
  showOwnerField?: boolean;
  loading?: boolean;
  onSubmit: (values: PropertyFormValues) => void;
  submitLabel?: string;
}) {
  const { register, handleSubmit } = useForm<PropertyFormValues>({ defaultValues });

  const { data: owners } = useQuery({
    queryKey: ["owners", "all-for-select"],
    queryFn: async () => (await api.get("/owners?limit=100")).data,
    enabled: !!showOwnerField,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {showOwnerField && (
        <div>
          <Label>Propriétaire</Label>
          <Select {...register("ownerId", { required: true })}>
            <option value="">Sélectionner...</option>
            {owners?.data?.map((o: any) => (
              <option key={o.id} value={o.id}>
                {o.fullName}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Nom du bien</Label>
          <Input placeholder="Ex : Villa Riviera 3" {...register("name", { required: true })} />
        </div>
        <div>
          <Label>Type</Label>
          <Select {...register("type", { required: true })}>
            {Object.values(PropertyType).map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Commune</Label>
          <Select {...register("commune", { required: true })}>
            {COMMUNES_ABIDJAN.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Adresse complète</Label>
          <Input placeholder="Rue, quartier..." {...register("address", { required: true })} />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea rows={2} {...register("description")} />
        </div>
        <div>
          <Label>Pièces</Label>
          <Input type="number" {...register("rooms", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Chambres</Label>
          <Input type="number" {...register("bedrooms", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Douches</Label>
          <Input type="number" {...register("bathrooms", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Surface (m²)</Label>
          <Input type="number" {...register("surfaceM2", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Loyer mensuel (FCFA)</Label>
          <Input type="number" {...register("rentAmount", { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <Label>Caution (FCFA)</Label>
          <Input type="number" {...register("deposit", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Avance (FCFA)</Label>
          <Input type="number" {...register("advance", { valueAsNumber: true })} />
        </div>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
