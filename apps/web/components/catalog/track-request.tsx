"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { SearchCheck } from "lucide-react";
import { SHORT_STAY_STATUS_COLORS, SHORT_STAY_STATUS_LABELS, VISIT_REQUEST_STATUS_COLORS, VISIT_REQUEST_STATUS_LABELS } from "@ivologis/shared";
import { api, apiErrorMessage } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { t } from "@/lib/t-catalog";
import { locale } from "@/lib/t";

interface Tracked {
  kind: "VISITE" | "SEJOUR";
  reference: string;
  status: string;
  createdAt: string;
  preferredDate?: string | null;
  checkIn?: string;
  checkOut?: string;
  property: { name: string; commune: string };
}

const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString(locale(), { dateStyle: "long" }) : null);

/** Suivi d'une demande sans compte (P1-07) : référence reçue à l'envoi + téléphone saisi dans la demande. */
export function TrackRequest() {
  const params = useSearchParams();
  const [result, setResult] = useState<Tracked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ reference: string; phone: string }>({
    defaultValues: { reference: params.get("ref") ?? "", phone: "" },
  });

  async function onSubmit(values: { reference: string; phone: string }) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult((await api.get("/catalog/track", { params: values })).data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const visit = result?.kind === "VISITE";
  const statusKey = result?.status as keyof typeof VISIT_REQUEST_STATUS_LABELS & keyof typeof SHORT_STAY_STATUS_LABELS;
  const status = result ? t((visit ? VISIT_REQUEST_STATUS_LABELS : SHORT_STAY_STATUS_LABELS)[statusKey] ?? result.status) : "";
  const statusColor = result ? (visit ? VISIT_REQUEST_STATUS_COLORS : SHORT_STAY_STATUS_COLORS)[statusKey] : undefined;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-ink">{t("Suivre ma demande")}</h1>
      <p className="mt-2 text-sm text-ink-muted">
        {t("Saisissez la référence reçue après l'envoi (par exemple RDV-2026-A1B2C3D4) et le numéro de téléphone indiqué dans votre demande.")}
      </p>
      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="track-reference">{t("Référence")}</Label>
            <Input id="track-reference" autoComplete="off" className="font-mono uppercase" {...register("reference", { required: true })} />
          </div>
          <div>
            <Label htmlFor="track-phone">{t("Téléphone")}</Label>
            <Input id="track-phone" type="tel" inputMode="tel" placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            <SearchCheck className="h-4 w-4" /> {t("Voir l'avancement")}
          </Button>
        </form>
      </Card>

      {/* Zone toujours présente : le résultat ou l'erreur est annoncé aux lecteurs d'écran dès qu'il s'affiche. */}
      <div aria-live="polite" data-track-result>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {result && (
        <Card className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {result.kind === "VISITE" ? t("Demande de visite") : t("Demande de réservation")} · <span className="font-mono">{result.reference}</span>
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">{result.property.name}</p>
          <p className="text-sm text-ink-muted">{result.property.commune}</p>
          <p className="mt-4 text-sm text-ink">
            {t("Statut :")} <Badge color={statusColor}>{status}</Badge>
          </p>
          {result.kind === "VISITE" && result.preferredDate && (
            <p className="mt-1 text-sm text-ink-muted">{t("Date souhaitée : {0}", day(result.preferredDate))}</p>
          )}
          {result.kind === "SEJOUR" && (
            <p className="mt-1 text-sm text-ink-muted">{t("Du {0} au {1}", day(result.checkIn), day(result.checkOut))}</p>
          )}
          <p className="mt-1 text-xs text-ink-muted">{t("Envoyée le {0}", day(result.createdAt))}</p>
        </Card>
      )}
      </div>
    </div>
  );
}
