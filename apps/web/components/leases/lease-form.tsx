"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { LeaseType, LEASE_TYPE_LABELS, LEASE_TYPE_DESCRIPTIONS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { t as tr } from "@/lib/t-spaces";
import { money } from "@/lib/t";

interface LeaseFormFields {
  type: LeaseType;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  advance: number;
  specialConditions?: string;
  // Habitation (nue ou meublée)
  occupantsCount?: number;
  noticePeriodMonths?: number;
  furnitureInventory?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  // Commercial
  businessActivity?: string;
  tradeName?: string;
  pasDePorte?: number;
  renewalTacite?: boolean;
  // Professionnel
  profession?: string;
  professionalOrder?: string;
  // Terrain
  landUse?: string;
  constructionPermitRequired?: boolean;
  titleReference?: string;
}

export interface LeaseFormValues {
  type: LeaseType;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  advance: number;
  specialConditions?: string;
  details?: Record<string, unknown>;
}

const HABITATION_TYPES = [LeaseType.HABITATION_NUE, LeaseType.HABITATION_MEUBLEE];

export function LeaseForm({ loading, onSubmit }: { loading?: boolean; onSubmit: (v: LeaseFormValues) => void }) {
  const { register, handleSubmit, watch, setValue, getValues, formState } = useForm<LeaseFormFields>({
    defaultValues: { type: LeaseType.HABITATION_NUE },
  });

  const type = watch("type");
  const rentAmount = watch("rentAmount");
  const deposit = watch("deposit");
  const advance = watch("advance");
  const isHabitation = HABITATION_TYPES.includes(type);
  const depositCeiling = isHabitation && Number(rentAmount) > 0 ? Number(rentAmount) * 2 : 0;
  const depositExceeds = depositCeiling > 0 && Number(deposit) > depositCeiling;
  const advanceExceeds = depositCeiling > 0 && Number(advance) > depositCeiling;

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

  function submit(values: LeaseFormFields) {
    const {
      type: leaseType,
      propertyId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      deposit,
      advance,
      specialConditions,
      occupantsCount,
      noticePeriodMonths,
      furnitureInventory,
      guarantorName,
      guarantorPhone,
      guarantorAddress,
      businessActivity,
      tradeName,
      pasDePorte,
      renewalTacite,
      profession,
      professionalOrder,
      landUse,
      constructionPermitRequired,
      titleReference,
    } = values;

    let details: Record<string, unknown> = {};
    if (HABITATION_TYPES.includes(leaseType)) {
      details = {
        occupantsCount: occupantsCount ? String(occupantsCount) : undefined,
        noticePeriodMonths: noticePeriodMonths ? String(noticePeriodMonths) : undefined,
        guarantorName,
        guarantorPhone,
        guarantorAddress,
        ...(leaseType === LeaseType.HABITATION_MEUBLEE ? { furnitureInventory } : {}),
      };
    } else if (leaseType === LeaseType.COMMERCIAL) {
      details = {
        businessActivity,
        tradeName,
        pasDePorte: pasDePorte ? String(pasDePorte) : undefined,
        renewalTacite: !!renewalTacite,
      };
    } else if (leaseType === LeaseType.PROFESSIONNEL) {
      details = { profession, professionalOrder };
    } else if (leaseType === LeaseType.TERRAIN) {
      details = {
        landUse,
        constructionPermitRequired: !!constructionPermitRequired,
        titleReference,
      };
    }

    onSubmit({
      type: leaseType,
      propertyId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      deposit,
      advance,
      specialConditions,
      details,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <Label>{tr("Type de contrat")}</Label>
        <Select {...register("type", { required: true })}>
          {Object.values(LeaseType).map((t) => (
            <option key={t} value={t}>
              {tr(LEASE_TYPE_LABELS[t])}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-ink-muted">{LEASE_TYPE_DESCRIPTIONS[type]}</p>
      </div>

      <div>
        <Label>{tr("Bien (vacant uniquement)")}</Label>
        <Select {...register("propertyId", { required: true, onChange: (e) => onPropertyChange(e.target.value) })}>
          <option value="">{tr("Sélectionner...")}</option>
          {properties?.data?.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.commune}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{tr("Locataire")}</Label>
        <Select {...register("tenantId", { required: true })}>
          <option value="">{tr("Sélectionner...")}</option>
          {tenants?.data?.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="lf-start">{tr("Date de début")}</Label>
          <Input id="lf-start" type="date" {...register("startDate", { required: true })} />
        </div>
        <div>
          <Label htmlFor="lf-end">{tr("Date de fin")}</Label>
          <Input
            id="lf-end"
            type="date"
            min={watch("startDate") || undefined}
            {...register("endDate", {
              required: true,
              validate: (end) => !getValues("startDate") || end > getValues("startDate") || tr("La fin doit être après le début."),
            })}
          />
          {formState.errors.endDate?.message && <p className="mt-1 text-xs text-danger">{formState.errors.endDate.message}</p>}
        </div>
        <div>
          <Label>{tr("Loyer (FCFA)")}</Label>
          <Input type="number" {...register("rentAmount", { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Caution (FCFA)")}</Label>
          <Input type="number" {...register("deposit", { required: true, valueAsNumber: true })} />
        </div>
        <div className="col-span-2">
          <Label>{tr("Avance (FCFA)")}</Label>
          <Input type="number" {...register("advance", { required: true, valueAsNumber: true })} />
        </div>
      </div>

      {(depositExceeds || advanceExceeds) && (
        <div className="flex gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            {depositExceeds && advanceExceeds
              ? tr("La caution et l'avance dépassent toutes les deux 2 mois de loyer")
              : depositExceeds
                ? tr("La caution dépasse 2 mois de loyer")
                : tr("L'avance dépasse 2 mois de loyer")}{" "}{tr("({0} maximum par poste). Le Code de la construction et de l'habitat (loi n° 2019-576) plafonne la caution et l'avance à 2 mois de loyer chacune pour un bail d'habitation : le contrat ne pourra pas être enregistré.", money(depositCeiling))}
          </p>
        </div>
      )}

      {/* --- Champs dynamiques selon le type de contrat --- */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
          {tr("Détails spécifiques du bail ({0})", LEASE_TYPE_LABELS[type])}
        </p>

        {HABITATION_TYPES.includes(type) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{tr("Nombre d'occupants max.")}</Label>
              <Input type="number" {...register("occupantsCount", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>{tr("Préavis de résiliation (mois)")}</Label>
              <Input type="number" {...register("noticePeriodMonths", { valueAsNumber: true })} />
            </div>
            {type === LeaseType.HABITATION_MEUBLEE && (
              <div className="col-span-2">
                <Label>{tr("Inventaire du mobilier")}</Label>
                <Textarea rows={2} placeholder={tr("Ex : salon complet, lit, climatiseur, cuisinière...")} {...register("furnitureInventory")} />
              </div>
            )}
            <p className="col-span-2 mt-1 text-xs font-medium text-ink-muted">{tr("Garant / caution solidaire (optionnel)")}</p>
            <div className="col-span-2">
              <Label>{tr("Nom du garant")}</Label>
              <Input {...register("guarantorName")} />
            </div>
            <div>
              <Label>{tr("Téléphone du garant")}</Label>
              <Input {...register("guarantorPhone")} />
            </div>
            <div>
              <Label>{tr("Adresse du garant")}</Label>
              <Input {...register("guarantorAddress")} />
            </div>
          </div>
        )}

        {type === LeaseType.COMMERCIAL && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>{tr("Activité commerciale exercée")}</Label>
              <Input placeholder={tr("Ex : vente de vêtements, restauration...")} {...register("businessActivity", { required: true })} />
            </div>
            <div>
              <Label>{tr("Enseigne commerciale")}</Label>
              <Input {...register("tradeName")} />
            </div>
            <div>
              <Label>{tr("Droit au bail / pas-de-porte (FCFA)")}</Label>
              <Input type="number" {...register("pasDePorte", { valueAsNumber: true })} />
            </div>
            <label className="col-span-2 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register("renewalTacite")} />
              {tr("Renouvellement tacite (bail commercial 3-6-9)")}
            </label>
          </div>
        )}

        {type === LeaseType.PROFESSIONNEL && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{tr("Profession exercée")}</Label>
              <Input placeholder={tr("Ex : avocat, médecin, consultant...")} {...register("profession", { required: true })} />
            </div>
            <div>
              <Label>{tr("Ordre professionnel / agrément")}</Label>
              <Input placeholder={tr("Optionnel")} {...register("professionalOrder")} />
            </div>
          </div>
        )}

        {type === LeaseType.TERRAIN && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>{tr("Usage prévu du terrain")}</Label>
              <Input placeholder={tr("Ex : construction résidentielle, stockage...")} {...register("landUse", { required: true })} />
            </div>
            <div className="col-span-2">
              <Label>{tr("Référence titre foncier / ACD / lettre d'attribution")}</Label>
              <Input {...register("titleReference")} />
            </div>
            <label className="col-span-2 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register("constructionPermitRequired")} />
              {tr("Autorisation de construire requise avant toute construction")}
            </label>
          </div>
        )}
      </div>

      <div>
        <Label>{tr("Conditions particulières")}</Label>
        <Textarea rows={2} {...register("specialConditions")} />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        {tr("Créer le contrat")}
      </Button>
    </form>
  );
}
