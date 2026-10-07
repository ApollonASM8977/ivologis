"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const AdminFinancialCharts = dynamic(() => import("@/components/charts/admin-financial-charts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-72 w-full lg:col-span-1" />
      <Skeleton className="h-72 w-full lg:col-span-1" />
      <Skeleton className="h-72 w-full lg:col-span-2" />
    </div>
  ),
});

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "financial"],
    queryFn: async () => (await api.get("/reports/financial")).data,
  });

  if (isLoading || !data) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Statistiques" subtitle="Analyse financière globale de la plateforme" />
      <AdminFinancialCharts data={data} />
    </div>
  );
}
