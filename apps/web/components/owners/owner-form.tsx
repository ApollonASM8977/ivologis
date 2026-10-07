"use client";

import { useForm } from "react-hook-form";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

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
  const { register, handleSubmit } = useForm<OwnerFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SectionTitle>Identité</SectionTitle>
        <div className="col-span-2">
          <Label>Nom complet</Label>
          <Input placeholder="Ex : Kouadio Jean" {...register("fullName", { required: true })} />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
        </div>
        <div>
          <Label>Téléphone secondaire</Label>
          <Input placeholder="Optionnel" {...register("secondaryPhone")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
        </div>
        <div>
          <Label>Nationalité</Label>
          <Input {...register("nationality")} />
        </div>
        <div className="col-span-2">
          <Label>Adresse</Label>
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

        <SectionTitle>Profession / Société</SectionTitle>
        <div>
          <Label>Profession</Label>
          <Input {...register("profession")} />
        </div>
        <div>
          <Label>Société (si applicable)</Label>
          <Input {...register("companyName")} />
        </div>
        <div className="col-span-2">
          <Label>N° RCCM (si société)</Label>
          <Input {...register("rccmNumber")} />
        </div>

        <SectionTitle>Coordonnées bancaires (reversement loyers)</SectionTitle>
        <div>
          <Label>Banque</Label>
          <Input {...register("bankName")} />
        </div>
        <div>
          <Label>N° de compte</Label>
          <Input {...register("bankAccountNumber")} />
        </div>
      </div>

      {showPassword && (
        <div>
          <Label>Mot de passe (optionnel, crée un accès de connexion)</Label>
          <Input type="password" placeholder="Laisser vide si aucun accès" {...register("password")} />
        </div>
      )}
      <Button type="submit" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
