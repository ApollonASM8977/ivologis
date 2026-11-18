"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { PaymentMethod } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { t } from "@/lib/t-spaces";
import { invalidForm } from "@/lib/form";

interface SettingsForm {
  companyName: string;
  address?: string;
  email?: string;
  phone?: string;
  whatsappPhone?: string;
  legalName?: string;
  rccmNumber?: string;
  taxNumber?: string;
  agentLicenseNumber?: string;
  artciNumber?: string;
  publicationDirector?: string;
  commissionRate: number;
  enabledPaymentMethods: PaymentMethod[];
}

const FIELDS: (keyof SettingsForm)[] = [
  "companyName", "address", "email", "phone", "whatsappPhone", "legalName", "rccmNumber", "taxNumber",
  "agentLicenseNumber", "artciNumber", "publicationDirector", "commissionRate", "enabledPaymentMethods",
];

// L'API refuse les champs inconnus (id, dates…) : on n'envoie que ceux du formulaire, null → chaîne vide évitée.
function toPayload(values: SettingsForm) {
  return Object.fromEntries(FIELDS.filter((k) => values[k] != null).map((k) => [k, values[k]]));
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get("/settings")).data,
  });

  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: SettingsForm) => api.patch("/settings", toPayload(values)),
    onSuccess: () => {
      toast.success(t("Paramètres mis à jour."));
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={t("Paramètres")} subtitle={t("Configuration générale de l'entreprise IVOLOGIS")} />

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v), invalidForm)} className="space-y-4">
        <Card>
          <CardHeader title={t("Informations de l'entreprise")} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("Nom de l'entreprise")}</Label>
              <Input {...register("companyName", { required: true })} />
            </div>
            <div>
              <Label>{t("Taux de commission (%)")}</Label>
              <Input type="number" step="0.1" {...register("commissionRate", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>{t("Email")}</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>{t("Téléphone")}</Label>
              <Input {...register("phone")} />
            </div>
            <div>
              <Label>{t("WhatsApp de l'agence")}</Label>
              <Input placeholder="+225 07 ..." {...register("whatsappPhone")} />
            </div>
            <div>
              <Label>{t("Adresse du siège")}</Label>
              <Input {...register("address")} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t("Identité légale")}
            subtitle={t("Affichée dans les mentions légales et le pied de page. Un champ vide n'apparaît nulle part.")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("Raison sociale")}</Label>
              <Input placeholder={t("Ex : IVOLOGIS SARL")} {...register("legalName")} />
            </div>
            <div>
              <Label>{t("Directeur de la publication")}</Label>
              <Input {...register("publicationDirector")} />
            </div>
            <div>
              <Label>{t("N° RCCM")}</Label>
              <Input placeholder="CI-ABJ-..." {...register("rccmNumber")} />
            </div>
            <div>
              <Label>{t("N° de compte contribuable (NCC)")}</Label>
              <Input {...register("taxNumber")} />
            </div>
            <div>
              <Label>{t("N° d'agrément d'agent immobilier")}</Label>
              <Input {...register("agentLicenseNumber")} />
            </div>
            <div>
              <Label>{t("N° d'autorisation ARTCI (données personnelles)")}</Label>
              <Input {...register("artciNumber")} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t("Moyens de paiement activés")} subtitle={t("Visibles par les locataires lors du paiement")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.values(PaymentMethod).map((method) => (
              <label key={method} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50">
                <input type="checkbox" value={method} className="h-4 w-4 rounded border-gray-300" {...register("enabledPaymentMethods")} />
                <PaymentMethodBadge method={method} size="sm" />
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" loading={updateMutation.isPending}>
          {t("Enregistrer les modifications")}
        </Button>
      </form>
    </div>
  );
}
