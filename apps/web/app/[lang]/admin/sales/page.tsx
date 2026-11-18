"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";
import { api } from "@/lib/api";
import { SALE_STATUS_LABELS, SALE_STATUS_COLORS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { t } from "@/lib/t-spaces";
import { money } from "@/lib/t";

interface SaleRow {
  id: string;
  name: string;
  commune: string;
  salePrice: string | number;
  saleStatus: string;
  owner: { fullName: string };
  saleOffers: { id: string }[];
}

export default function AdminSalesPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery<SaleRow[]>({
    queryKey: ["sales"],
    queryFn: async () => (await api.get("/sales")).data,
  });

  const columns: Column<SaleRow>[] = [
    { header: "Bien", cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { header: "Commune", cell: (r) => r.commune },
    { header: t("Propriétaire"), cell: (r) => r.owner?.fullName ?? "-" },
    { header: t("Prix demandé"), cell: (r) => money(Number(r.salePrice ?? 0)) },
    { header: "Offres", cell: (r) => r.saleOffers?.length ?? 0 },
    {
      header: "Statut",
      cell: (r) => (
        <Badge color={SALE_STATUS_COLORS[r.saleStatus as keyof typeof SALE_STATUS_COLORS]}>
          {t(SALE_STATUS_LABELS[r.saleStatus as keyof typeof SALE_STATUS_LABELS])}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("Ventes")} subtitle={t("Biens mis en vente, offres reçues et ventes finalisées")} />

      {!isLoading && data?.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={t("Aucun bien en vente")}
          description={t("Ouvrez la fiche d'un bien et utilisez « Mettre en vente » pour le faire apparaître ici.")}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          loading={isLoading}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/admin/properties/${r.id}`)}
        />
      )}
    </div>
  );
}
