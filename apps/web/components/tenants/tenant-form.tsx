"use client";

import { useForm } from "react-hook-form";
import { DocumentType, DOCUMENT_TYPE_LABELS, MaritalStatus, MARITAL_STATUS_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SectionTitle>Identité</SectionTitle>
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
        <div>
          <Label>Date de naissance</Label>
          <Input type="date" {...register("dateOfBirth")} />
        </div>
        <div>
          <Label>Lieu de naissance</Label>
          <Input {...register("placeOfBirth")} />
        </div>
        <div>
          <Label>Nationalité</Label>
          <Input {...register("nationality")} />
        </div>
        <div>
          <Label>Situation matrimoniale</Label>
          <Select {...register("maritalStatus")}>
            <option value="">Non renseignée</option>
            {Object.values(MaritalStatus).map((m) => (
              <option key={m} value={m}>
                {MARITAL_STATUS_LABELS[m]}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Adresse actuelle</Label>
          <Input {...register("address")} />
        </div>

        <SectionTitle>Pièce d&apos;identité</SectionTitle>
        <div>
          <Label>Type de document</Label>
          <Select {...register("idDocumentType")}>
            <option value="">Non renseigné</option>
            {Object.values(DocumentType).map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Numéro de document</Label>
          <Input {...register("idDocumentNumber")} />
        </div>

        <SectionTitle>Situation professionnelle</SectionTitle>
        <div>
          <Label>Profession</Label>
          <Input {...register("profession")} />
        </div>
        <div>
          <Label>Employeur</Label>
          <Input {...register("employer")} />
        </div>
        <div>
          <Label>Revenu mensuel (FCFA)</Label>
          <Input type="number" {...register("monthlyIncome", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Mot de passe (optionnel)</Label>
          <Input type="password" {...register("password")} />
          <PasswordStrengthMeter password={password ?? ""} />
        </div>

        <SectionTitle>Contact d&apos;urgence</SectionTitle>
        <div>
          <Label>Nom</Label>
          <Input {...register("emergencyContactName")} />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input {...register("emergencyContactPhone")} />
        </div>

        <SectionTitle>Garant / Caution solidaire</SectionTitle>
        <div className="col-span-2">
          <Label>Nom du garant</Label>
          <Input placeholder="Optionnel" {...register("guarantorName")} />
        </div>
        <div>
          <Label>Téléphone du garant</Label>
          <Input {...register("guarantorPhone")} />
        </div>
        <div>
          <Label>Adresse du garant</Label>
          <Input {...register("guarantorAddress")} />
        </div>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
