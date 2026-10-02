"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { formatXOF, SIGNATURE_STATUS_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";

export default function TenantLeasePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["leases", "mine"],
    queryFn: async () => (await api.get("/leases", { params: { limit: 1 } })).data,
  });

  if (isLoading) return <LoadingState />;
  const lease = data?.data?.[0];

  if (!lease) {
    return (
      <div>
        <PageHeader title="Mon contrat" />
        <EmptyState icon={FileText} title="Aucun contrat actif" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mon contrat de bail" subtitle={lease.contractNumber} />

      <Card className="max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <LeaseStatusBadge status={lease.status} />
          <span className="text-sm text-ink-muted">{SIGNATURE_STATUS_LABELS[lease.signatureStatus as keyof typeof SIGNATURE_STATUS_LABELS]}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink-muted">Bien</p>
            <p className="font-medium text-ink">{lease.property?.name}</p>
          </div>
          <div>
            <p className="text-ink-muted">Propriétaire</p>
            <p className="font-medium text-ink">{lease.owner?.fullName}</p>
          </div>
          <div>
            <p className="text-ink-muted">Date de début</p>
            <p className="font-medium text-ink">{new Date(lease.startDate).toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-ink-muted">Date de fin</p>
            <p className="font-medium text-ink">{new Date(lease.endDate).toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-ink-muted">Loyer mensuel</p>
            <p className="font-medium text-ink">{formatXOF(lease.rentAmount)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Caution</p>
            <p className="font-medium text-ink">{formatXOF(lease.deposit)}</p>
          </div>
        </div>

        {lease.specialConditions && (
          <div className="mt-4">
            <p className="text-sm text-ink-muted">Conditions particulières</p>
            <p className="text-sm text-ink">{lease.specialConditions}</p>
          </div>
        )}

        {lease.documentUrl && (
          <a href={fileUrl(lease.documentUrl)} target="_blank" className="mt-6 inline-block">
            <Button size="sm">
              <Download className="h-4 w-4" /> Télécharger le contrat (PDF)
            </Button>
          </a>
        )}
      </Card>
    </div>
  );
}
