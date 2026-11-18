"use client";

import { PayoutsCard } from "@/components/owners/payouts-card";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { api, apiErrorMessage, downloadFile } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { LoadingState } from "@/components/ui/empty-state";
import { Wallet, TrendingDown, TrendingUp, Wrench } from "lucide-react";
import { t } from "@/lib/t-spaces";
import { money } from "@/lib/t";

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

  const [exporting, setExporting] = useState<string | null>(null);

  async function exportStatement(format: "pdf" | "csv") {
    if (!owner?.id) return;
    setExporting(format);
    try {
      await downloadFile(`/reports/owner/${owner.id}/export?format=${format}`, `releve-financier.${format}`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setExporting(null);
    }
  }

  if (isLoading || !report) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title={t("Relevé financier")}
        subtitle={t("Synthèse de vos revenus locatifs")}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" loading={exporting === "csv"} onClick={() => exportStatement("csv")}>
              <FileSpreadsheet className="h-4 w-4" />{" "}{t("CSV")}
            </Button>
            <Button size="sm" loading={exporting === "pdf"} onClick={() => exportStatement("pdf")}>
              <FileDown className="h-4 w-4" />{" "}{t("Exporter PDF")}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("Revenus totaux")} value={money(report.totalRevenue)} icon={TrendingUp} tone="success" />
        <StatCard label={t("Commission IVOLOGIS")} value={money(report.commission)} icon={Wallet} tone="warning" />
        <StatCard label={t("Dépenses maintenance")} value={money(report.maintenanceCosts)} icon={Wrench} tone="danger" />
        <StatCard label={t("Solde net")} value={money(report.netBalance)} icon={TrendingDown} tone="primary" />
      </div>

      <Card className="mt-6">
        <CardHeader title={t("Biens les plus rentables")} />
        <div className="space-y-2">
          {report.mostProfitableProperties?.length ? (
            report.mostProfitableProperties.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{item.property?.name} · {item.property?.commune}</span>
                <span className="font-semibold text-success">{money(item.revenue)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">{t("Aucune donnée disponible.")}</p>
          )}
        </div>
      </Card>
      <div className="mt-6"><PayoutsCard ownerId={owner?.id ?? ""} canRecord={false} /></div>
    </div>
  );
}
