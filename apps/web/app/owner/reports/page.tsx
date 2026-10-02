"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { LoadingState } from "@/components/ui/empty-state";
import { Wallet, TrendingDown, TrendingUp, Wrench } from "lucide-react";

export default function OwnerReportsPage() {
  const { data: owner } = useQuery({
    queryKey: ["owners", "me"],
    queryFn: async () => (await api.get("/owners/me")).data,
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["reports", "owner", owner?.id],
    queryFn: async () => (await api.get(`/reports/owner/${owner.id}`)).data,
    enabled: !!owner?.id,
  });

  if (isLoading || !report) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Relevé financier" subtitle="Synthèse de vos revenus locatifs" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenus totaux" value={formatXOF(report.totalRevenue)} icon={TrendingUp} tone="success" />
        <StatCard label="Commission IVOLOGIS" value={formatXOF(report.commission)} icon={Wallet} tone="warning" />
        <StatCard label="Dépenses maintenance" value={formatXOF(report.maintenanceCosts)} icon={Wrench} tone="danger" />
        <StatCard label="Solde net" value={formatXOF(report.netBalance)} icon={TrendingDown} tone="primary" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Biens les plus rentables" />
        <div className="space-y-2">
          {report.mostProfitableProperties?.length ? (
            report.mostProfitableProperties.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{item.property?.name} — {item.property?.commune}</span>
                <span className="font-semibold text-success">{formatXOF(item.revenue)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Aucune donnée disponible.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
