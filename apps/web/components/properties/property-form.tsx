"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { PropertyType, PROPERTY_TYPE_LABELS, COMMUNES_ABIDJAN, PROPERTY_AMENITIES } from "@ivologis/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export interface PropertyFormValues {
  name: string;
  type: PropertyType;
  description?: string;
  address: string;
  commune: string;
  landmark?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  surfaceM2?: number;
  floor?: number;
  yearBuilt?: number;
  furnished?: boolean;
  amenities?: string[];
  rentAmount: number;
  deposit?: number;
  advance?: number;
  ownerId?: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-primary first:mt-0">
      {children}
    </p>
  );
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
        <SectionTitle>Informations générales</SectionTitle>
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
          <Label>Année de construction</Label>
          <Input type="number" placeholder="Ex : 2018" {...register("yearBuilt", { valueAsNumber: true })} />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea rows={2} placeholder="Points forts, ambiance du quartier..." {...register("description")} />
        </div>

        <SectionTitle>Localisation précise</SectionTitle>
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
        <div>
          <Label>Repère / point de repère</Label>
          <Input placeholder="Ex : face à la pharmacie, derrière l'école..." {...register("landmark")} />
        </div>
        <div className="col-span-2">
          <Label>Adresse complète</Label>
          <Input placeholder="Rue, lot, îlot, quartier précis..." {...register("address", { required: true })} />
        </div>

        <SectionTitle>Caractéristiques</SectionTitle>
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
          <Label>Étage</Label>
          <Input type="number" placeholder="0 = rez-de-chaussée" {...register("floor", { valueAsNumber: true })} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register("furnished")} />
            Bien meublé
          </label>
        </div>

        <SectionTitle>Équipements</SectionTitle>
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROPERTY_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" value={a} className="h-4 w-4 rounded border-gray-300" {...register("amenities")} />
              {a}
            </label>
          ))}
        </div>

        <SectionTitle>Finances</SectionTitle>
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
