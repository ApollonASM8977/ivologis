"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Inbox, LogIn } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatXOF, VISIT_REQUEST_STATUS_LABELS, VISIT_REQUEST_STATUS_COLORS, SHORT_STAY_STATUS_LABELS, SHORT_STAY_STATUS_COLORS } from "@ivologis/shared";
import { useAuthStore } from "@/lib/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";

export function MyRequests() {
  const user = useAuthStore((s) => s.user);

  const { data: visits, isLoading: visitsLoading } = useQuery<any[]>({
    queryKey: ["visit-requests", "mine"],
    queryFn: async () => (await api.get("/visit-requests/mine")).data,
    enabled: !!user,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["short-stay-bookings", "mine"],
    queryFn: async () => (await api.get("/short-stay-bookings/mine")).data,
    enabled: !!user,
  });

  const isLoading = visitsLoading || bookingsLoading;

  if (!user) {
    return (
      <div>
        <PageHeader title="Mes demandes" subtitle="Vos demandes de visite (vente) et de réservation (courte durée)" />
        <Card className="text-center">
          <LogIn className="mx-auto h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm text-ink-muted">
            Sans compte, votre demande reste suivie par référence : conservez celle qui vous a été donnée après l&apos;envoi, l&apos;agence vous recontactera directement.
            Connectez-vous pour retrouver vos demandes ici automatiquement.
          </p>
          <Link href="/login" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            Se connecter
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mes demandes" subtitle="Vos demandes de visite (vente) et de réservation (courte durée)" />

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Demandes de visite" />
            {!visits?.length ? (
              <EmptyState icon={CalendarCheck} title="Aucune demande" description="Vos demandes de visite sur un bien en vente apparaîtront ici." />
            ) : (
              <div className="space-y-2">
                {visits.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{v.property?.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {v.property?.commune}
                        {v.scheduledDate && ` · RDV le ${new Date(v.scheduledDate).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                    <Badge color={VISIT_REQUEST_STATUS_COLORS[v.status as keyof typeof VISIT_REQUEST_STATUS_COLORS]}>
                      {VISIT_REQUEST_STATUS_LABELS[v.status as keyof typeof VISIT_REQUEST_STATUS_LABELS]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Demandes de réservation courte durée" />
            {!bookings?.length ? (
              <EmptyState icon={Inbox} title="Aucune demande" description="Vos demandes de réservation en courte durée apparaîtront ici." />
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{b.property?.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {new Date(b.checkIn).toLocaleDateString("fr-FR")} → {new Date(b.checkOut).toLocaleDateString("fr-FR")}, {formatXOF(Number(b.totalAmount))}
                      </p>
                    </div>
                    <Badge color={SHORT_STAY_STATUS_COLORS[b.status as keyof typeof SHORT_STAY_STATUS_COLORS]}>
                      {SHORT_STAY_STATUS_LABELS[b.status as keyof typeof SHORT_STAY_STATUS_LABELS]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
