"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarRange, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF, SHORT_STAY_STATUS_LABELS, SHORT_STAY_STATUS_COLORS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { DocumentLink } from "@/components/document-link";

interface BookingRow {
  id: string;
  checkIn: string;
  checkOut: string;
  totalAmount: string | number;
  status: string;
  receiptUrl?: string | null;
  property: { name: string; commune: string; address: string };
}

export default function TenantShortStayPage() {
  const { data: bookings, isLoading } = useQuery<BookingRow[]>({
    queryKey: ["short-stay-bookings", "mine"],
    queryFn: async () => (await api.get("/short-stay-bookings/mine")).data,
  });

  return (
    <div>
      <PageHeader title="Mes réservations" subtitle="Vos séjours en location courte durée" />

      {isLoading ? (
        <LoadingState />
      ) : !bookings?.length ? (
        <EmptyState icon={CalendarRange} title="Aucune réservation" description="Vos séjours en courte durée apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{b.property.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin className="h-3.5 w-3.5" /> {b.property.address}, {b.property.commune}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {new Date(b.checkIn).toLocaleDateString("fr-FR")} → {new Date(b.checkOut).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge color={SHORT_STAY_STATUS_COLORS[b.status as keyof typeof SHORT_STAY_STATUS_COLORS]}>
                    {SHORT_STAY_STATUS_LABELS[b.status as keyof typeof SHORT_STAY_STATUS_LABELS]}
                  </Badge>
                  <p className="mt-2 font-semibold text-ink">{formatXOF(Number(b.totalAmount))}</p>
                  {b.receiptUrl && (
                    <DocumentLink path={b.receiptUrl} className="mt-1 block text-xs font-medium text-primary hover:underline">
                      Quittance
                    </DocumentLink>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
