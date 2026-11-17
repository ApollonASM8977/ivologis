"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X as XIcon } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { formatXOF, rentalEntryCost, VISIT_REQUEST_STATUS_LABELS, VISIT_REQUEST_STATUS_COLORS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Publication d'un bien vacant dans le catalogue « Logements à louer » et suivi des demandes de visite. */
export function RentListingCard({ property }: { property: any }) {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const isStaff = role === "SUPER_ADMIN" || role === "ADMIN_AGENT";
  const rent = Number(property.rentAmount);
  const canPublish = property.status === "VACANT" && rent > 0 && !property.archivedAt;

  const { data: requests } = useQuery<any[]>({
    queryKey: ["visit-requests", property.id],
    queryFn: async () => (await api.get(`/properties/${property.id}/visit-requests`)).data,
    enabled: property.rentListed,
  });

  const publish = useMutation({
    mutationFn: (value: boolean) => api.patch(`/properties/${property.id}`, { rentListed: value }),
    onSuccess: (_r, value) => {
      toast.success(value ? "Logement publié dans le catalogue." : "Logement retiré du catalogue.");
      queryClient.invalidateQueries({ queryKey: ["properties", property.id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decide = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => api.patch(`/visit-requests/${id}/${accept ? "confirm" : "refuse"}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visit-requests", property.id] }),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!property.rentListed && !(isStaff && canPublish)) return null;
  const cost = rentalEntryCost(rent, Number(property.deposit), Number(property.advance));

  return (
    <Card className="mt-4">
      <CardHeader title="Mise en location au catalogue" />
      <div
        className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${property.rentListed ? "bg-success/10 text-green-900" : "bg-surface text-ink"}`}
      >
        <span>
          {property.rentListed
            ? `Publié dans « Logements à louer » : ${formatXOF(rent)}/mois, ${formatXOF(cost.total)} à l'entrée.`
            : "Ce bien vacant n'est pas publié. Vérifiez le loyer, l'avance, la caution et les photos avant de le publier."}
        </span>
        {isStaff && (
          <Button size="sm" variant={property.rentListed ? "secondary" : "primary"} loading={publish.isPending} onClick={() => publish.mutate(!property.rentListed)}>
            {property.rentListed ? "Retirer du catalogue" : "Publier à la location"}
          </Button>
        )}
      </div>

      {property.rentListed && (
        <>
          <p className="mb-1 text-xs font-semibold uppercase text-ink-muted">Demandes de visite</p>
          {!requests?.length ? (
            <p className="text-sm text-ink-muted">Aucune demande pour l&apos;instant.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{v.user?.fullName ?? v.guestName}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {v.user?.phone ?? v.guestPhone ?? v.guestEmail}
                      {v.preferredDate && ` · souhaité le ${new Date(v.preferredDate).toLocaleDateString("fr-FR")}`} · réf. {v.reference}
                    </p>
                    {v.message && <p className="truncate text-xs text-ink-muted">« {v.message} »</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={VISIT_REQUEST_STATUS_COLORS[v.status as keyof typeof VISIT_REQUEST_STATUS_COLORS]}>
                      {VISIT_REQUEST_STATUS_LABELS[v.status as keyof typeof VISIT_REQUEST_STATUS_LABELS]}
                    </Badge>
                    {v.status === "EN_ATTENTE" && (
                      <>
                        <button type="button" title="Confirmer" className="rounded p-1 text-success hover:bg-success/10" onClick={() => decide.mutate({ id: v.id, accept: true })}>
                          <Check className="h-4 w-4" />
                        </button>
                        <button type="button" title="Refuser" className="rounded p-1 text-danger hover:bg-danger/10" onClick={() => decide.mutate({ id: v.id, accept: false })}>
                          <XIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
