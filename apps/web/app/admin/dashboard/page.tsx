"use client";

import { RevisionsDueCard } from "@/components/leases/revisions-due-card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Building2, Users, UserRound, Wallet, AlertTriangle, Wrench, Plus, Download } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/empty-state";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["reports", "dashboard"],
    queryFn: async () => (await api.get("/reports/dashboard")).data,
  });

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité IVOLOGIS"
        action={
          <div className="flex gap-2">
            <Link href="/admin/properties?new=1">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Ajouter un bien
              </Button>
            </Link>
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/payments/export`} target="_blank">
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4" /> Exporter
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
            <StatCard label="Biens au total" value={data.totalProperties} icon={Building2} hint={`${data.occupied} loués · ${data.vacant} vacants`} />
            <StatCard label="Revenus du mois" value={formatXOF(data.monthlyRevenue)} icon={Wallet} tone="success" />
            <StatCard label="Paiements en retard" value={data.overdueCount} icon={AlertTriangle} tone="danger" />
            <StatCard label="Maintenance ouverte" value={data.openMaintenanceCount} icon={Wrench} tone="warning" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Propriétaires" value={data.ownersCount} icon={Users} />
            <StatCard label="Locataires" value={data.tenantsCount} icon={UserRound} />
            <StatCard label="Taux d'occupation" value={`${data.occupancyRate}%`} icon={Building2} tone="primary" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Revenus mensuels" subtitle="6 derniers mois, paiements confirmés" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueChart}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B5FFF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0B5FFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
                    <Area type="monotone" dataKey="revenue" stroke="#0B5FFF" fill="url(#revenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader title="Actions rapides" />
              <div className="space-y-2">
                <Link href="/admin/properties?new=1"><Button variant="secondary" className="w-full justify-start">Ajouter un bien</Button></Link>
                <Link href="/admin/owners?new=1"><Button variant="secondary" className="w-full justify-start">Ajouter un propriétaire</Button></Link>
                <Link href="/admin/tenants?new=1"><Button variant="secondary" className="w-full justify-start">Ajouter un locataire</Button></Link>
                <Link href="/admin/payments"><Button variant="secondary" className="w-full justify-start">Voir les transactions</Button></Link>
              </div>
            </Card>
          </div>
        </>
      )}
      <div className="mt-4"><RevisionsDueCard /></div>
    </div>
  );
}
