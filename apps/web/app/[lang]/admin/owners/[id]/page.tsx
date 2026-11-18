"use client";

import { PayoutsCard } from "@/components/owners/payouts-card";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2 } from "lucide-react";
import { api } from "@/lib/api";

import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { PropertyStatusBadge } from "@/components/status-badges";
import { InviteCodeCard } from "@/components/invite-code-card";
import { t } from "@/lib/t-spaces";
import { money } from "@/lib/t";

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: owner, isLoading } = useQuery({
    queryKey: ["owners", id],
    queryFn: async () => (await api.get(`/owners/${id}`)).data,
  });

  const { data: summary } = useQuery({
    queryKey: ["owners", id, "revenue-summary"],
    queryFn: async () => (await api.get(`/owners/${id}/revenue-summary`)).data,
  });

  if (isLoading || !owner) return <LoadingState />;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />{" "}{t("Retour")}
      </button>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {owner.fullName.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink">{owner.fullName}</h1>
          <p className="text-sm text-ink-muted">{owner.phone} {owner.email ? `· ${owner.email}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">{t("Biens")}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{summary?.propertiesCount ?? owner._count?.properties ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">{t("Revenus perçus (total)")}</p>
          <p className="mt-1 text-2xl font-semibold text-success">{money(summary?.totalRevenue ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">{t("Adresse")}</p>
          <p className="mt-1 text-sm font-medium text-ink">{owner.address ?? "-"}</p>
        </Card>
      </div>

      <div className="mt-4">
        <InviteCodeCard resource="owners" id={id} userId={owner.userId} pendingUntil={owner.inviteExpiresAt} />
      </div>

      <Card>
        <CardHeader title={t("Informations complémentaires")} />
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-ink-muted">{t("Téléphone secondaire")}</p>
            <p className="font-medium text-ink">{owner.secondaryPhone ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Nationalité")}</p>
            <p className="font-medium text-ink">{owner.nationality ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Profession")}</p>
            <p className="font-medium text-ink">{owner.profession ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Société")}</p>
            <p className="font-medium text-ink">{owner.companyName ?? "-"}</p>
          </div>
          {owner.rccmNumber && (
            <div>
              <p className="text-ink-muted">{t("N° RCCM")}</p>
              <p className="font-medium text-ink">{owner.rccmNumber}</p>
            </div>
          )}
          <div>
            <p className="text-ink-muted">{t("Pièce d'identité")}</p>
            <p className="font-medium text-ink">{owner.idDocumentNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("Banque")}</p>
            <p className="font-medium text-ink">{owner.bankName ?? "-"}</p>
          </div>
          <div>
            <p className="text-ink-muted">{t("N° de compte")}</p>
            <p className="font-medium text-ink">{owner.bankAccountNumber ?? "-"}</p>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 mt-6 text-base font-semibold text-ink">{t("Biens du propriétaire")}</h2>
      {owner.properties?.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {owner.properties.map((p: any) => (
            <Card key={p.id} className="cursor-pointer" onClick={() => router.push(`/admin/properties/${p.id}`)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-muted">{p.commune}</p>
                </div>
                <PropertyStatusBadge status={p.status} />
              </div>
              <p className="mt-3 text-sm font-semibold text-primary">{t("{0}/mois", money(p.rentAmount))}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title={t("Aucun bien pour ce propriétaire")} />
      )}
      <div className="mt-4"><PayoutsCard ownerId={id} canRecord /></div>
    </div>
  );
}
