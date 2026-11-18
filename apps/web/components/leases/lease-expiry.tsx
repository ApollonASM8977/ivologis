"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, CalendarClock, CalendarX2, RefreshCw, Hourglass } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

const DAY = 24 * 60 * 60 * 1000;
const RENEW_OPTIONS = [6, 12, 24, 36];

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / DAY);
}

/** Libellé court de la décision d'échéance (null = à décider, 0 = non reconduit, N = reconduction tacite de N mois). */
export function expiryDecisionLabel(months: number | null | undefined) {
  if (months === null || months === undefined) return { text: "Décision à prendre", color: "amber" as const };
  if (months === 0) return { text: "Non reconduit", color: "red" as const };
  return { text: `Reconduction tacite (${months} mois)`, color: "green" as const };
}

function whenLabel(days: number) {
  if (days > 1) return `dans ${days} jours`;
  if (days === 1) return "demain";
  if (days === 0) return "aujourd'hui";
  return `échu depuis ${-days} jour${days < -1 ? "s" : ""}`;
}

/** Fiche contrat : l'agence choisit en un clic ce qui se passe à l'échéance ; c'est appliqué automatiquement le jour venu. */
export function LeaseExpiryCard({ lease }: { lease: any }) {
  const queryClient = useQueryClient();
  const [months, setMonths] = useState<number>(lease.autoRenewMonths > 0 ? lease.autoRenewMonths : 12);
  const days = daysUntil(lease.endDate);
  const current: number | null = lease.autoRenewMonths ?? null;
  const decision = expiryDecisionLabel(current);
  const end = new Date(lease.endDate).toLocaleDateString("fr-FR", { dateStyle: "long" });

  const save = useMutation({
    mutationFn: (value: number | null) => api.patch(`/leases/${lease.id}/expiry-decision`, { autoRenewMonths: value }),
    onSuccess: () => {
      toast.success("Décision d'échéance enregistrée.");
      queryClient.invalidateQueries({ queryKey: ["leases"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (lease.status === "EXPIRED") {
    return (
      <Card>
        <CardHeader title="Échéance du bail" subtitle={`Arrivé à échéance le ${end}`} />
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
          <CalendarX2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Bail non reconduit : faites l&apos;état des lieux de sortie, la restitution du dépôt de garantie, puis la résiliation depuis la liste des contrats.
        </p>
      </Card>
    );
  }
  if (lease.status !== "ACTIVE") return null;

  const choice = (active: boolean) =>
    `ivo-press flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
      active ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-ink hover:border-primary/40 hover:text-primary"
    }`;

  return (
    <Card>
      <CardHeader title="Échéance du bail" subtitle={`Fin le ${end} · ${whenLabel(days)}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-muted">À l&apos;échéance :</span>
        <Badge color={decision.color}>{decision.text}</Badge>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row" role="group" aria-label="Décision à l'échéance">
        <div className="flex flex-1 gap-2">
          <button type="button" className={choice(!!current && current > 0)} disabled={save.isPending} aria-pressed={!!current && current > 0} onClick={() => save.mutate(months)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reconduire
          </button>
          <Select aria-label="Durée de la reconduction" className="w-28" value={months} onChange={(e) => {
            const value = Number(e.target.value);
            setMonths(value);
            if (current && current > 0) save.mutate(value);
          }}>
            {RENEW_OPTIONS.map((m) => <option key={m} value={m}>{m} mois</option>)}
          </Select>
        </div>
        <button type="button" className={choice(current === 0)} disabled={save.isPending} aria-pressed={current === 0} onClick={() => save.mutate(0)}>
          <CalendarX2 className="h-4 w-4" aria-hidden="true" /> Ne pas reconduire
        </button>
        <button type="button" className={choice(current === null)} disabled={save.isPending} aria-pressed={current === null} onClick={() => save.mutate(null)}>
          <Hourglass className="h-4 w-4" aria-hidden="true" /> Décider plus tard
        </button>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Appliqué automatiquement le jour de l&apos;échéance ; l&apos;agence est alertée 90, 60 et 30 jours avant. Sans décision, le bail reste actif (le locataire
        occupe toujours le bien). Pour changer le loyer ou les dates, utilisez « Renouveler » dans la liste des contrats.
      </p>
    </Card>
  );
}

/** Tableau de bord : baux qui se terminent dans les 90 jours, avec la décision prévue. */
export function ExpiriesDueCard() {
  const { data } = useQuery<any[]>({
    queryKey: ["leases", "expiries", "due"],
    queryFn: async () => (await api.get("/leases/expiries/due")).data,
  });
  const rows = data ?? [];

  return (
    <Card>
      <CardHeader title="Baux à échéance" subtitle="Fins de contrat dans les 90 prochains jours" />
      {rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-muted"><CalendarClock className="h-4 w-4" /> Aucun bail n&apos;arrive à échéance prochainement.</p>
      ) : (
        <ul className="stagger-children space-y-2">
          {rows.slice(0, 8).map((r) => {
            const decision = expiryDecisionLabel(r.autoRenewMonths);
            const days = daysUntil(r.endDate);
            return (
              <li key={r.id}>
                <Link href={`/admin/leases/${r.id}`} className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm transition-all hover:border-primary/30 hover:bg-primary/5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{r.tenant?.fullName} · {r.property?.name}</p>
                    <p className={`text-xs ${days <= 0 ? "font-semibold text-danger" : "text-ink-muted"}`}>
                      Fin le {new Date(r.endDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })} · {whenLabel(days)}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Badge color={decision.color}>{decision.text}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
