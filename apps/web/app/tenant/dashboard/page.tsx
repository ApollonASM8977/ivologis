"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Home, Wallet, FileText, Wrench, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge, LeaseStatusBadge } from "@/components/status-badges";

export default function TenantDashboardPage() {
  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });

  const { data: payments } = useQuery({
    queryKey: ["payments", "mine", "recent"],
    queryFn: async () => (await api.get("/payments", { params: { limit: 3 } })).data,
  });

  const { data: maintenance } = useQuery({
    queryKey: ["maintenance", "mine", "open"],
    queryFn: async () => (await api.get("/maintenance", { params: { limit: 5 } })).data,
  });

  if (loadingProperties) return <LoadingState />;

  const property = properties?.[0];
  const lease = property?.leases?.[0];

  return (
    <div>
      <PageHeader title="Mon tableau de bord" subtitle="Bienvenue sur votre espace locataire IVOLOGIS" />

      {!property ? (
        <EmptyState icon={Home} title="Aucun logement associé" description="Contactez votre agence si vous pensez qu'il s'agit d'une erreur." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title={property.name} subtitle={`${property.address}, ${property.commune}`} />
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-ink-muted">Loyer mensuel</p>
                <p className="font-semibold text-ink">{formatXOF(property.rentAmount)}</p>
              </div>
              <div>
                <p className="text-ink-muted">Statut du contrat</p>
                {lease ? <LeaseStatusBadge status={lease.status} /> : <span>—</span>}
              </div>
              <div>
                <p className="text-ink-muted">Propriétaire</p>
                <p className="font-semibold text-ink">{property.owner?.fullName}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/tenant/payments">
                <Button size="sm">
                  Payer maintenant <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tenant/maintenance">
                <Button size="sm" variant="secondary">
                  Signaler un problème
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Raccourcis" />
            <div className="space-y-2">
              <Link href="/tenant/lease"><Button variant="ghost" className="w-full justify-start"><FileText className="h-4 w-4" /> Mon contrat</Button></Link>
              <Link href="/tenant/payments"><Button variant="ghost" className="w-full justify-start"><Wallet className="h-4 w-4" /> Historique paiements</Button></Link>
              <Link href="/tenant/maintenance"><Button variant="ghost" className="w-full justify-start"><Wrench className="h-4 w-4" /> Mes demandes</Button></Link>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Derniers paiements" />
          {payments?.data?.length ? (
            payments.data.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{new Date(p.paymentDate).toLocaleDateString("fr-FR")}</span>
                <span className="font-medium">{formatXOF(p.amount)}</span>
                <PaymentStatusBadge status={p.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Aucun paiement enregistré.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Mes demandes de maintenance" />
          {maintenance?.data?.length ? (
            maintenance.data.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                <span className="line-clamp-1">{m.description}</span>
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
