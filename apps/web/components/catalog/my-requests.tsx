"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF, VISIT_REQUEST_STATUS_LABELS, VISIT_REQUEST_STATUS_COLORS, SHORT_STAY_STATUS_LABELS, SHORT_STAY_STATUS_COLORS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";

export function MyRequests() {
  const { data: visits, isLoading: visitsLoading } = useQuery<any[]>({
    queryKey: ["visit-requests", "mine"],
    queryFn: async () => (await api.get("/visit-requests/mine")).data,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["short-stay-bookings", "mine"],
    queryFn: async () => (await api.get("/short-stay-bookings/mine")).data,
  });

  const isLoading = visitsLoading || bookingsLoading;

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
