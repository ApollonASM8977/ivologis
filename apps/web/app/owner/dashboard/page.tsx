"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Wallet, AlertTriangle, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function OwnerDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: async () => (await api.get("/reports/dashboard")).data,
  });

  if (isLoading || !data) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Mon tableau de bord" subtitle="Vue d'ensemble de vos biens" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mes biens" value={data.totalProperties} icon={Building2} hint={`${data.occupied} loués · ${data.vacant} vacants`} />
        <StatCard label="Revenus du mois" value={formatXOF(data.monthlyRevenue)} icon={Wallet} tone="success" />
        <StatCard label="Paiements en retard" value={data.overdueCount} icon={AlertTriangle} tone="danger" />
        <StatCard label="Maintenance ouverte" value={data.openMaintenanceCount} icon={Wrench} tone="warning" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Revenus mensuels" subtitle="6 derniers mois" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueChart}>
              <defs>
                <linearGradient id="ownerRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B5FFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0B5FFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#0B5FFF" fill="url(#ownerRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
