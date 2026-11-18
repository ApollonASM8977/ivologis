"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { PropertyType, PROPERTY_TYPE_LABELS, COMMUNES_ABIDJAN, VILLES_CI, PROPERTY_AMENITIES } from "@ivologis/shared";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { t as tr } from "@/lib/t-spaces";

export interface PropertyFormValues {
  name: string;
  type: PropertyType;
  description?: string;
  address: string;
  city?: string;
  commune: string;
  neighborhood?: string;
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
  shortStayEnabled?: boolean;
  shortStayNightlyRate?: number;
  latitude?: number;
  longitude?: number;
  virtualTourUrl?: string;
  isDemo?: boolean;
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
  const { register, handleSubmit, watch } = useForm<PropertyFormValues>({ defaultValues: { city: "Abidjan", ...defaultValues } });
  const shortStayEnabled = watch("shortStayEnabled");
  const city = watch("city");
  const role = useAuthStore((s) => s.user?.role);
  const isStaff = role === "SUPER_ADMIN" || role === "ADMIN_AGENT";

  const { data: owners } = useQuery({
    queryKey: ["owners", "all-for-select"],
    queryFn: async () => (await api.get("/owners?limit=100")).data,
    enabled: !!showOwnerField,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {showOwnerField && (
        <div>
          <Label>{tr("Propriétaire")}</Label>
          <Select {...register("ownerId", { required: true })}>
            <option value="">{tr("Sélectionner...")}</option>
            {owners?.data?.map((o: any) => (
              <option key={o.id} value={o.id}>
                {o.fullName}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SectionTitle>{tr("Informations générales")}</SectionTitle>
        <div className="col-span-2">
          <Label>{tr("Nom du bien")}</Label>
          <Input placeholder={tr("Ex : Villa Riviera 3")} {...register("name", { required: true })} />
        </div>
        <div>
          <Label>{tr("Type")}</Label>
          <Select {...register("type", { required: true })}>
            {Object.values(PropertyType).map((t) => (
              <option key={t} value={t}>
                {tr(PROPERTY_TYPE_LABELS[t])}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{tr("Année de construction")}</Label>
          <Input type="number" placeholder="Ex : 2018" {...register("yearBuilt", { valueAsNumber: true })} />
        </div>
        <div className="col-span-2">
          <Label>{tr("Description")}</Label>
          <Textarea rows={2} placeholder={tr("Points forts, ambiance du quartier...")} {...register("description")} />
        </div>

        <SectionTitle>{tr("Localisation précise")}</SectionTitle>
        <div>
          <Label>{tr("Ville")}</Label>
          <Select {...register("city")}>
            {VILLES_CI.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{tr("Commune")}</Label>
          {city === "Abidjan" ? (
            <Select {...register("commune", { required: true })}>
              {COMMUNES_ABIDJAN.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          ) : (
            <Input placeholder={tr("Commune ou localité")} {...register("commune", { required: true })} />
          )}
        </div>
        <div>
          <Label>{tr("Quartier")}</Label>
          <Input placeholder={tr("Ex : Riviera 3, Angré 8e Tranche, Zone 4")} {...register("neighborhood")} />
        </div>
        <div>
          <Label>{tr("Repère / point de repère")}</Label>
          <Input placeholder={tr("Ex : face à la pharmacie, derrière l'école...")} {...register("landmark")} />
        </div>
        <div className="col-span-2">
          <Label>{tr("Adresse complète")}</Label>
          <Input placeholder={tr("Rue, lot, îlot...")} {...register("address", { required: true })} />
        </div>
        <div>
          <Label>{tr("Latitude (optionnel)")}</Label>
          <Input type="number" step="0.000001" placeholder="Ex : 5.363000" {...register("latitude", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Longitude (optionnel)")}</Label>
          <Input type="number" step="0.000001" placeholder="Ex : -3.956000" {...register("longitude", { valueAsNumber: true })} />
        </div>

        <SectionTitle>{tr("Caractéristiques")}</SectionTitle>
        <div>
          <Label>{tr("Pièces")}</Label>
          <Input type="number" {...register("rooms", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Chambres")}</Label>
          <Input type="number" {...register("bedrooms", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Douches")}</Label>
          <Input type="number" {...register("bathrooms", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Surface (m²)")}</Label>
          <Input type="number" {...register("surfaceM2", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Étage")}</Label>
          <Input type="number" placeholder={tr("0 = rez-de-chaussée")} {...register("floor", { valueAsNumber: true })} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register("furnished")} />
            {tr("Bien meublé")}
          </label>
        </div>

        <SectionTitle>{tr("Équipements")}</SectionTitle>
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROPERTY_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" value={a} className="h-4 w-4 rounded border-gray-300" {...register("amenities")} />
              {a}
            </label>
          ))}
        </div>

        <SectionTitle>{tr("Finances")}</SectionTitle>
        <div>
          <Label>{tr("Loyer mensuel (FCFA)")}</Label>
          <Input type="number" {...register("rentAmount", { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Caution (FCFA)")}</Label>
          <Input type="number" {...register("deposit", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Avance (FCFA)")}</Label>
          <Input type="number" {...register("advance", { valueAsNumber: true })} />
        </div>

        <SectionTitle>{tr("Location courte durée")}</SectionTitle>
        <div className="col-span-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register("shortStayEnabled")} />
            {tr("Proposer ce bien en courte durée (séjours à la nuitée)")}
          </label>
        </div>
        {shortStayEnabled && (
          <div>
            <Label>{tr("Tarif par nuitée (FCFA)")}</Label>
            <Input type="number" {...register("shortStayNightlyRate", { valueAsNumber: true })} />
          </div>
        )}

        <SectionTitle>{tr("Visite virtuelle")}</SectionTitle>
        <div className="col-span-2">
          <Label>{tr("Lien visite virtuelle 360° (optionnel)")}</Label>
          <Input placeholder={tr("Lien Matterport, Kuula, ou autre visite 360°...")} {...register("virtualTourUrl")} />
        </div>

        {isStaff && (
          <div className="col-span-2">
            <label className="flex items-start gap-2 text-sm text-ink">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" {...register("isDemo")} />
              <span>
                {tr("Annonce de démonstration (bien fictif)")}
                <span className="block text-xs text-ink-muted">{tr("Affiche un bandeau « Démo » et bloque toute demande de visite ou de réservation.")}</span>
              </span>
            </label>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        {tr(submitLabel)}
      </Button>
    </form>
  );
}
