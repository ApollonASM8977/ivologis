"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Building2, Wallet, AlertTriangle, Wrench, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { formatXOF } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { CountUp } from "@/components/dashboard/count-up";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

const RevenueAreaChart = dynamic(() => import("@/components/charts/revenue-area-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function OwnerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.fullName?.split(" ")[0] ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: async () => (await api.get("/reports/dashboard")).data,
  });

  const { data: overdue } = useQuery({
    queryKey: ["payments", "overdue", "owner"],
    queryFn: async () => (await api.get("/payments/overdue")).data,
  });

  const { data: maintenance } = useQuery({
    queryKey: ["maintenance", "owner", "dashboard"],
    queryFn: async () => (await api.get("/maintenance", { params: { limit: 5 } })).data,
  });

  if (isLoading || !data) return <LoadingState />;

  const occupancy = data.totalProperties ? data.occupied / data.totalProperties : 0;
  const now = new Date();

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-ink-muted">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Bonjour{firstName ? `, ${firstName}` : ""}</h1>
        <p className="text-sm text-ink-muted">Voici l&apos;état de vos biens aujourd&apos;hui.</p>
      </motion.div>

      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="flex items-center gap-5 lg:col-span-1">
              <ProgressRing value={occupancy} size={96} stroke={9} color="#16A34A">
                <div className="text-center">
                  <p className="text-lg font-bold text-ink">
                    <CountUp value={Math.round(occupancy * 100)} />%
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-ink-muted">occupés</p>
                </div>
              </ProgressRing>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-ink">
                  <CountUp value={data.totalProperties} /> bien{data.totalProperties > 1 ? "s" : ""}
                </p>
                <p className="text-ink-muted">{data.occupied} loué(s) · {data.vacant} vacant(s)</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
              {[
                { label: "Revenus du mois", value: data.monthlyRevenue, format: (n: number) => formatXOF(n), icon: Wallet, tone: "text-success bg-success/10" },
                { label: "Loyers en retard", value: data.overdueCount, format: undefined, icon: AlertTriangle, tone: "text-danger bg-danger/10" },
                { label: "Maintenance ouverte", value: data.openMaintenanceCount, format: undefined, icon: Wrench, tone: "text-warning bg-warning/10" },
              ].map((k) => (
                <Card key={k.label} className="transition-shadow hover:shadow-lg hover:shadow-primary/5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.tone}`}>
                    <k.icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-sm text-ink-muted">{k.label}</p>
                  <p className="mt-1 text-xl font-bold text-ink">
                    <CountUp value={Number(k.value)} format={k.format} />
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardHeader title="Revenus mensuels" subtitle="6 derniers mois" />
            <div className="h-72">
              <RevenueAreaChart data={data.revenueChart} gradientId="ownerRevenue" />
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Loyers en retard" subtitle={overdue?.length ? `${overdue.length} à suivre` : "Tout est à jour"} />
              {overdue?.length ? (
                <ul className="space-y-2">
                  {overdue.slice(0, 5).map((o: any, i: number) => (
                    <motion.li
                      key={o.leaseId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{o.tenant?.fullName}</p>
                        <p className="truncate text-xs text-ink-muted">{o.property?.name}</p>
                      </div>
                      <span className="shrink-0 font-semibold text-danger">{formatXOF(Number(o.rentAmount))}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-success/5 px-4 py-6 text-sm text-ink-muted">
                  <Sparkles className="h-5 w-5 text-success" /> Aucun loyer en retard ce mois-ci.
                </div>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Maintenance récente"
                action={
                  <Link href="/owner/maintenance" className="text-sm font-medium text-primary hover:underline">
                    Tout voir
                  </Link>
                }
              />
              {maintenance?.data?.length ? (
                <ul className="space-y-2">
                  {maintenance.data.map((m: any, i: number) => (
                    <motion.li key={m.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                      <Link href={`/owner/maintenance/${m.id}`} className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm transition-all hover:border-primary/30 hover:bg-primary/5">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{m.description}</p>
                          <p className="truncate text-xs text-ink-muted">{m.property?.name}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <MaintenanceStatusBadge status={m.status} />
                          <ArrowRight className="h-4 w-4 -translate-x-1 text-ink-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Building2} title="Aucune demande" description="Les demandes de vos locataires apparaîtront ici." />
              )}
            </Card>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
