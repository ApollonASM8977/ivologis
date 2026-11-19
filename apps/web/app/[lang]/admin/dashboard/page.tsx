"use client";

import { RevisionsDueCard } from "@/components/leases/revisions-due-card";
import { ExpiriesDueCard } from "@/components/leases/lease-expiry";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Building2, Users, UserRound, Wallet, AlertTriangle, Wrench, Plus, Download, ClipboardCheck } from "lucide-react";
import { api } from "@/lib/api";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/t-spaces";
import { money } from "@/lib/t";

const RevenueAreaChart = dynamic(() => import("@/components/charts/revenue-area-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface DashboardData {
  totalProperties: number;
  occupied: number;
  vacant: number;
  ownersCount: number;
  tenantsCount: number;
  monthlyRevenue: number;
  overdueCount: number;
  openMaintenanceCount: number;
  occupancyRate: number;
  revenueChart: { month: string; revenue: number }[];
  toReviewCount: number;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["reports", "dashboard"],
    queryFn: async () => (await api.get("/reports/dashboard")).data,
  });

  return (
    <div>
      <PageHeader
        title={t("Tableau de bord")}
        subtitle={t("Vue d'ensemble de l'activité IVOLOGIS")}
        action={
          <div className="flex gap-2">
            <Link href="/admin/properties?new=1">
              <Button size="sm">
                <Plus className="h-4 w-4" />{" "}{t("Ajouter un bien")}
              </Button>
            </Link>
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/payments/export`} target="_blank">
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4" />{" "}{t("Exporter")}
              </Button>
            </a>
          </div>
        }
      />

      {isLoading || !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("Biens au total")} value={data.totalProperties} icon={Building2} hint={t("{0} loués · {1} vacants", data.occupied, data.vacant)} />
            <StatCard label={t("Revenus du mois")} value={money(data.monthlyRevenue)} icon={Wallet} tone="success" />
            <StatCard label={t("Paiements en retard")} value={data.overdueCount} icon={AlertTriangle} tone="danger" />
            <StatCard label={t("Maintenance ouverte")} value={data.openMaintenanceCount} icon={Wrench} tone="warning" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("Propriétaires")} value={data.ownersCount} icon={Users} />
            <StatCard label={t("Locataires")} value={data.tenantsCount} icon={UserRound} />
            <StatCard label={t("Taux d'occupation")} value={`${data.occupancyRate}%`} icon={Building2} tone="primary" />
            <Link href="/admin/properties?toReview=1" aria-label={t("Voir les annonces à vérifier")}>
              <StatCard label={t("Annonces à vérifier")} value={data.toReviewCount ?? 0} icon={ClipboardCheck} tone={data.toReviewCount ? "warning" : undefined} />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title={t("Revenus mensuels")} subtitle={t("6 derniers mois, paiements confirmés")} />
              <div className="h-72">
                <RevenueAreaChart data={data.revenueChart} gradientId="revenue" />
              </div>
            </Card>

            <Card>
              <CardHeader title={t("Actions rapides")} />
              <div className="space-y-2">
                <Link href="/admin/properties?new=1"><Button variant="secondary" className="w-full justify-start">{t("Ajouter un bien")}</Button></Link>
                <Link href="/admin/owners?new=1"><Button variant="secondary" className="w-full justify-start">{t("Ajouter un propriétaire")}</Button></Link>
                <Link href="/admin/tenants?new=1"><Button variant="secondary" className="w-full justify-start">{t("Ajouter un locataire")}</Button></Link>
                <Link href="/admin/payments"><Button variant="secondary" className="w-full justify-start">{t("Voir les transactions")}</Button></Link>
              </div>
            </Card>
          </div>
        </>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExpiriesDueCard />
        <RevisionsDueCard />
      </div>
    </div>
  );
}
