"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange } from "lucide-react";
import { api } from "@/lib/api";
import { SHORT_STAY_STATUS_LABELS, SHORT_STAY_STATUS_COLORS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { t } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";

interface BookingRow {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: string | number;
  status: string;
  property: { id: string; name: string; commune: string };
}

export default function AdminShortStayPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery<BookingRow[]>({
    queryKey: ["short-stay-bookings", "upcoming"],
    queryFn: async () => (await api.get("/short-stay-bookings/upcoming")).data,
  });

  const columns: Column<BookingRow>[] = [
    { header: "Bien", cell: (r) => <span className="font-medium text-ink">{r.property?.name}</span> },
    { header: "Voyageur", cell: (r) => r.guestName },
    { header: t("Arrivée"), cell: (r) => new Date(r.checkIn).toLocaleDateString(locale()) },
    { header: t("Départ"), cell: (r) => new Date(r.checkOut).toLocaleDateString(locale()) },
    { header: "Montant", cell: (r) => money(Number(r.totalAmount)) },
    {
      header: "Statut",
      cell: (r) => (
        <Badge color={SHORT_STAY_STATUS_COLORS[r.status as keyof typeof SHORT_STAY_STATUS_COLORS]}>
          {t(SHORT_STAY_STATUS_LABELS[r.status as keyof typeof SHORT_STAY_STATUS_LABELS])}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("Courte durée")} subtitle={t("Réservations à venir sur les biens en location courte durée")} />

      {!isLoading && data?.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title={t("Aucune réservation à venir")}
          description={t("Activez la courte durée sur un bien (fiche bien → modifier) puis créez une réservation depuis sa fiche.")}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          loading={isLoading}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/admin/properties/${r.property.id}`)}
        />
      )}
    </div>
  );
}
