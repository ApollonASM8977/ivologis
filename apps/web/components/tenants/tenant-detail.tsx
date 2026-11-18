"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { MARITAL_STATUS_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { PaymentStatusBadge, LeaseStatusBadge, MaintenanceStatusBadge } from "@/components/status-badges";
import { InviteCodeCard } from "@/components/invite-code-card";
import { t } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";

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
        <ArrowLeft className="h-4 w-4" />{" "}{t("Retour")}
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

      <InviteCodeCard resource="tenants" id={id} userId={tenant.userId} pendingUntil={tenant.inviteExpiresAt} />

      <Card className="mb-4">
        <CardHeader title={t("Informations complémentaires")} />
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-ink-muted">{t("Nationalité")}</p>
            <p className="font-medium text-ink">{tenant.nationality ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Date de naissance")}</p>
            <p className="font-medium text-ink">{tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString(locale()) : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Situation matrimoniale")}</p>
            <p className="font-medium text-ink">{tenant.maritalStatus ? MARITAL_STATUS_LABELS[tenant.maritalStatus as keyof typeof MARITAL_STATUS_LABELS] : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Pièce d'identité")}</p>
            <p className="font-medium text-ink">{tenant.idDocumentNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Employeur")}</p>
            <p className="font-medium text-ink">{tenant.employer ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Revenu mensuel")}</p>
            <p className="font-medium text-ink">{tenant.monthlyIncome ? money(tenant.monthlyIncome) : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Contact d'urgence")}</p>
            <p className="font-medium text-ink">{tenant.emergencyContactName ? `${tenant.emergencyContactName} (${tenant.emergencyContactPhone ?? "-"})` : "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Garant")}</p>
            <p className="font-medium text-ink">{tenant.guarantorName ? `${tenant.guarantorName} (${tenant.guarantorPhone ?? "-"})` : "-"}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("Contrats")} />
          {tenant.leases?.length ? (
            tenant.leases.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{l.property?.name}</span>
                <span>{money(l.rentAmount)}</span>
                <LeaseStatusBadge status={l.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">{t("Aucun contrat.")}</p>
          )}
        </Card>

        <Card>
          <CardHeader title={t("Paiements récents")} />
          {tenant.payments?.length ? (
            tenant.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{new Date(p.paymentDate).toLocaleDateString(locale())}</span>
                <span>{money(p.amount)}</span>
                <PaymentStatusBadge status={p.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">{t("Aucun paiement.")}</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={t("Demandes de maintenance")} />
          {tenant.maintenanceRequests?.length ? (
            tenant.maintenanceRequests.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span className="line-clamp-1">{m.description}</span>
                <MaintenanceStatusBadge status={m.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">{t("Aucune demande.")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
