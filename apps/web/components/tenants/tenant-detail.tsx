"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF, MARITAL_STATUS_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { PaymentStatusBadge, LeaseStatusBadge, MaintenanceStatusBadge } from "@/components/status-badges";

export function TenantDetail({ id }: { id: string }) {
  const router = useRouter();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenants", id],
    queryFn: async () => (await api.get(`/tenants/${id}`)).data,
  });

  if (isLoading || !tenant) return <LoadingState />;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {tenant.fullName.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink">{tenant.fullName}</h1>
          <p className="text-sm text-ink-muted">
            {tenant.phone} {tenant.profession ? `· ${tenant.profession}` : ""}
          </p>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader title="Informations complémentaires" />
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-ink-muted">Nationalité</p>
            <p className="font-medium text-ink">{tenant.nationality ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Date de naissance</p>
            <p className="font-medium text-ink">{tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString("fr-FR") : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Situation matrimoniale</p>
            <p className="font-medium text-ink">{tenant.maritalStatus ? MARITAL_STATUS_LABELS[tenant.maritalStatus as keyof typeof MARITAL_STATUS_LABELS] : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Pièce d&apos;identité</p>
            <p className="font-medium text-ink">{tenant.idDocumentNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Employeur</p>
            <p className="font-medium text-ink">{tenant.employer ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Revenu mensuel</p>
            <p className="font-medium text-ink">{tenant.monthlyIncome ? formatXOF(tenant.monthlyIncome) : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Contact d&apos;urgence</p>
            <p className="font-medium text-ink">{tenant.emergencyContactName ? `${tenant.emergencyContactName} (${tenant.emergencyContactPhone ?? "-"})` : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Garant</p>
            <p className="font-medium text-ink">{tenant.guarantorName ? `${tenant.guarantorName} (${tenant.guarantorPhone ?? "-"})` : "-"}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Contrats" />
          {tenant.leases?.length ? (
            tenant.leases.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{l.property?.name}</span>
                <span>{formatXOF(l.rentAmount)}</span>
                <LeaseStatusBadge status={l.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Aucun contrat.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Paiements récents" />
          {tenant.payments?.length ? (
            tenant.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{new Date(p.paymentDate).toLocaleDateString("fr-FR")}</span>
                <span>{formatXOF(p.amount)}</span>
                <PaymentStatusBadge status={p.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Aucun paiement.</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Demandes de maintenance" />
          {tenant.maintenanceRequests?.length ? (
            tenant.maintenanceRequests.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span className="line-clamp-1">{m.description}</span>
                <MaintenanceStatusBadge status={m.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Aucune demande.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
