"use client";

import { useForm } from "react-hook-form";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";
import { t as tr } from "@/lib/t-spaces";

export interface OwnerFormValues {
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  nationality?: string;
  profession?: string;
  companyName?: string;
  rccmNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  idDocumentType?: DocumentType;
  idDocumentNumber?: string;
  password?: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-primary first:mt-0">
      {children}
    </p>
  );
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
  const { register, handleSubmit, watch } = useForm<OwnerFormValues>({ defaultValues });
  const password = watch("password");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SectionTitle>{tr("Identité")}</SectionTitle>
        <div className="col-span-2">
          <Label>{tr("Nom complet")}</Label>
          <Input placeholder={tr("Ex : Kouadio Jean")} {...register("fullName", { required: true })} />
        </div>
        <div>
          <Label>{tr("Téléphone")}</Label>
          <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
        </div>
        <div>
          <Label>{tr("Téléphone secondaire")}</Label>
          <Input placeholder={tr("Optionnel")} {...register("secondaryPhone")} />
        </div>
        <div>
          <Label>{tr("Email")}</Label>
          <Input type="email" {...register("email")} />
        </div>
        <div>
          <Label>{tr("Nationalité")}</Label>
          <Input {...register("nationality")} />
        </div>
        <div className="col-span-2">
          <Label>{tr("Adresse")}</Label>
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

        <SectionTitle>{tr("Profession / Société")}</SectionTitle>
        <div>
          <Label>{tr("Profession")}</Label>
          <Input {...register("profession")} />
        </div>
        <div>
          <Label>{tr("Société (si applicable)")}</Label>
          <Input {...register("companyName")} />
        </div>
        <div className="col-span-2">
          <Label>{tr("N° RCCM (si société)")}</Label>
          <Input {...register("rccmNumber")} />
        </div>

        <SectionTitle>{tr("Coordonnées bancaires (reversement loyers)")}</SectionTitle>
        <div>
          <Label>{tr("Banque")}</Label>
          <Input {...register("bankName")} />
        </div>
        <div>
          <Label>{tr("N° de compte")}</Label>
          <Input {...register("bankAccountNumber")} />
        </div>
      </div>

      {showPassword && (
        <div>
          <Label>{tr("Mot de passe (optionnel, crée un accès de connexion)")}</Label>
          <Input type="password" placeholder={tr("Laisser vide si aucun accès")} {...register("password")} />
          <PasswordStrengthMeter password={password ?? ""} />
        </div>
      )}
      <Button type="submit" className="w-full" loading={loading}>
        {tr(submitLabel)}
      </Button>
    </form>
  );
}
