"use client";

import { useForm } from "react-hook-form";
import { DocumentType, DOCUMENT_TYPE_LABELS, MaritalStatus, MARITAL_STATUS_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";
import { t as tr } from "@/lib/t-spaces";
import { invalidForm } from "@/lib/form";

export interface TenantFormValues {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  nationality?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: MaritalStatus;
  idDocumentType?: DocumentType;
  idDocumentNumber?: string;
  profession?: string;
  employer?: string;
  monthlyIncome?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  password?: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-primary first:mt-0">
      {children}
    </p>
  );
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
  const { register, handleSubmit, watch } = useForm<TenantFormValues>({ defaultValues });
  const password = watch("password");

  return (
    <form onSubmit={handleSubmit(onSubmit, invalidForm)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SectionTitle>{tr("Identité")}</SectionTitle>
        <div className="col-span-2">
          <Label>{tr("Nom complet")}</Label>
          <Input {...register("fullName", { required: true })} />
        </div>
        <div>
          <Label>{tr("Téléphone")}</Label>
          <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
        </div>
        <div>
          <Label>{tr("Email")}</Label>
          <Input type="email" {...register("email")} />
        </div>
        <div>
          <Label>{tr("Date de naissance")}</Label>
          <Input type="date" {...register("dateOfBirth")} />
        </div>
        <div>
          <Label>{tr("Lieu de naissance")}</Label>
          <Input {...register("placeOfBirth")} />
        </div>
        <div>
          <Label>{tr("Nationalité")}</Label>
          <Input {...register("nationality")} />
        </div>
        <div>
          <Label>{tr("Situation matrimoniale")}</Label>
          <Select {...register("maritalStatus")}>
            <option value="">{tr("Non renseignée")}</option>
            {Object.values(MaritalStatus).map((m) => (
              <option key={m} value={m}>
                {tr(MARITAL_STATUS_LABELS[m])}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-span-2">
          <Label>{tr("Adresse actuelle")}</Label>
          <Input {...register("address")} />
        </div>

        <SectionTitle>{tr("Pièce d'identité")}</SectionTitle>
        <div>
          <Label>{tr("Type de document")}</Label>
          <Select {...register("idDocumentType")}>
            <option value="">{tr("Non renseigné")}</option>
            {Object.values(DocumentType).map((t) => (
              <option key={t} value={t}>
                {tr(DOCUMENT_TYPE_LABELS[t])}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{tr("Numéro de document")}</Label>
          <Input {...register("idDocumentNumber")} />
        </div>

        <SectionTitle>{tr("Situation professionnelle")}</SectionTitle>
        <div>
          <Label>{tr("Profession")}</Label>
          <Input {...register("profession")} />
        </div>
        <div>
          <Label>{tr("Employeur")}</Label>
          <Input {...register("employer")} />
        </div>
        <div>
          <Label>{tr("Revenu mensuel (FCFA)")}</Label>
          <Input type="number" {...register("monthlyIncome", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{tr("Mot de passe (optionnel)")}</Label>
          <Input type="password" {...register("password")} />
          <PasswordStrengthMeter password={password ?? ""} />
        </div>

        <SectionTitle>{tr("Contact d'urgence")}</SectionTitle>
        <div>
          <Label>{tr("Nom")}</Label>
          <Input {...register("emergencyContactName")} />
        </div>
        <div>
          <Label>{tr("Téléphone")}</Label>
          <Input {...register("emergencyContactPhone")} />
        </div>

        <SectionTitle>{tr("Garant / Caution solidaire")}</SectionTitle>
        <div className="col-span-2">
          <Label>{tr("Nom du garant")}</Label>
          <Input placeholder={tr("Optionnel")} {...register("guarantorName")} />
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
      <Button type="submit" className="w-full" loading={loading}>
        {tr(submitLabel)}
      </Button>
    </form>
  );
}
