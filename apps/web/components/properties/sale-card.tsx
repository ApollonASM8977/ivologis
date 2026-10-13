"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Check, X as XIcon, Tag, FileUp } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatXOF, SALE_STATUS_LABELS, SALE_STATUS_COLORS, SALE_OFFER_STATUS_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentLink } from "@/components/document-link";

interface ListForSaleForm {
  salePrice: number;
  saleCommissionRate?: number;
}
interface OfferForm {
  buyerName: string;
  buyerPhone?: string;
  offerAmount: number;
}
interface FinalizeForm {
  buyerName: string;
  buyerPhone?: string;
  finalPrice: number;
  saleDate?: string;
}

export function SaleCard({
  propertyId,
  property,
  canManage,
}: {
  propertyId: string;
  property: any;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);

  const invalidateProperty = () => {
    queryClient.invalidateQueries({ queryKey: ["properties", propertyId] });
    queryClient.invalidateQueries({ queryKey: ["sale-offers", propertyId] });
  };

  const { data: offers } = useQuery({
    queryKey: ["sale-offers", propertyId],
    queryFn: async () => (await api.get(`/properties/${propertyId}/sale-offers`)).data,
    enabled: !!property?.forSale,
  });

  const listForm = useForm<ListForSaleForm>({ defaultValues: { salePrice: property?.salePrice ?? undefined, saleCommissionRate: property?.saleCommissionRate ?? undefined } });
  const offerForm = useForm<OfferForm>();
  const finalizeForm = useForm<FinalizeForm>();

  const listMutation = useMutation({
    mutationFn: (values: ListForSaleForm) => api.patch(`/properties/${propertyId}/sale`, { forSale: true, ...values }),
    onSuccess: () => {
      toast.success("Bien mis en vente.");
      invalidateProperty();
      setListModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const unlistMutation = useMutation({
    mutationFn: () => api.patch(`/properties/${propertyId}/sale`, { forSale: false }),
    onSuccess: () => {
      toast.success("Bien retiré de la vente.");
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const offerMutation = useMutation({
    mutationFn: (values: OfferForm) => api.post(`/properties/${propertyId}/sale-offers`, values),
    onSuccess: () => {
      toast.success("Offre enregistrée.");
      invalidateProperty();
      setOfferModalOpen(false);
      offerForm.reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const offerStatusMutation = useMutation({
    mutationFn: ({ offerId, accept }: { offerId: string; accept: boolean }) =>
      api.patch(`/sale-offers/${offerId}/${accept ? "accept" : "refuse"}`),
    onSuccess: () => {
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const documentMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return (await api.post(`/properties/${propertyId}/sale-document`, form)).data;
    },
    onSuccess: () => {
      toast.success("Document ajouté.");
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const finalizeMutation = useMutation({
    mutationFn: (values: FinalizeForm) => api.post(`/properties/${propertyId}/finalize-sale`, values),
    onSuccess: () => {
      toast.success("Vente finalisée. Le bien est archivé des biens actifs.");
      invalidateProperty();
      setFinalizeModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!property?.forSale) {
    if (!canManage) return null;
    return (
      <Card className="mt-4">
        <CardHeader title="Vente" />
        <p className="mb-3 text-sm text-ink-muted">Ce bien n&apos;est pas actuellement en vente.</p>
        <Button size="sm" variant="secondary" onClick={() => setListModalOpen(true)}>
          <Tag className="h-4 w-4" /> Mettre en vente
        </Button>

        <Modal open={listModalOpen} onClose={() => setListModalOpen(false)} title="Mettre ce bien en vente">
          <form onSubmit={listForm.handleSubmit((v) => listMutation.mutate(v))} className="space-y-3">
            <div>
              <Label>Prix de vente demandé (FCFA)</Label>
              <Input type="number" {...listForm.register("salePrice", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label>Commission de vente (%)</Label>
              <Input type="number" step="0.1" {...listForm.register("saleCommissionRate", { valueAsNumber: true })} />
            </div>
            <Button type="submit" className="w-full" loading={listMutation.isPending}>
              Mettre en vente
            </Button>
          </form>
        </Modal>
      </Card>
    );
  }

  const isSold = property.saleStatus === "VENDU";

  return (
    <Card className="mt-4">
      <CardHeader
        title="Vente"
        action={<Badge color={SALE_STATUS_COLORS[property.saleStatus as keyof typeof SALE_STATUS_COLORS]}>{SALE_STATUS_LABELS[property.saleStatus as keyof typeof SALE_STATUS_LABELS]}</Badge>}
      />

      {isSold ? (
        <div className="space-y-1 text-sm">
          <p className="text-ink">
            Vendu à <span className="font-medium">{property.saleBuyerName}</span> le{" "}
            {property.saleDate ? new Date(property.saleDate).toLocaleDateString("fr-FR") : "-"}
          </p>
          <p className="font-semibold text-success">{formatXOF(Number(property.saleFinalPrice))}</p>
          {property.saleDocumentUrl && (
            <DocumentLink path={property.saleDocumentUrl} className="text-sm font-medium text-primary hover:underline">
              Voir l&apos;acte / compromis
            </DocumentLink>
          )}
        </div>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase text-ink-muted">Prix demandé</p>
              <p className="font-semibold text-ink">{formatXOF(Number(property.salePrice ?? 0))}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-muted">Commission</p>
              <p className="font-semibold text-ink">{property.saleCommissionRate ? `${property.saleCommissionRate}%` : "-"}</p>
            </div>
          </div>

          {canManage && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setOfferModalOpen(true)}>
                <Plus className="h-4 w-4" /> Ajouter une offre
              </Button>
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} loading={documentMutation.isPending}>
                <FileUp className="h-4 w-4" /> Ajouter un document
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && documentMutation.mutate(e.target.files[0])}
              />
              <Button size="sm" onClick={() => setFinalizeModalOpen(true)}>
                Finaliser la vente
              </Button>
              <Button size="sm" variant="ghost" onClick={() => unlistMutation.mutate()} loading={unlistMutation.isPending}>
                Retirer de la vente
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {!offers?.length ? (
              <p className="text-sm text-ink-muted">Aucune offre reçue pour l&apos;instant.</p>
            ) : (
              offers.map((o: any) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{o.buyerName}</p>
                    <p className="truncate text-xs text-ink-muted">{o.buyerPhone} · {formatXOF(Number(o.offerAmount))}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge color={o.status === "ACCEPTEE" ? "green" : o.status === "REFUSEE" ? "red" : "amber"}>
                      {SALE_OFFER_STATUS_LABELS[o.status as keyof typeof SALE_OFFER_STATUS_LABELS]}
                    </Badge>
                    {canManage && o.status === "EN_ATTENTE" && (
                      <>
                        <button
                          type="button"
                          title="Accepter"
                          className="rounded p-1 text-success hover:bg-success/10"
                          onClick={() => offerStatusMutation.mutate({ offerId: o.id, accept: true })}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Refuser"
                          className="rounded p-1 text-danger hover:bg-danger/10"
                          onClick={() => offerStatusMutation.mutate({ offerId: o.id, accept: false })}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Modal open={offerModalOpen} onClose={() => setOfferModalOpen(false)} title="Ajouter une offre">
        <form onSubmit={offerForm.handleSubmit((v) => offerMutation.mutate(v))} className="space-y-3">
          <div>
            <Label>Nom de l&apos;acheteur</Label>
            <Input {...offerForm.register("buyerName", { required: true })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...offerForm.register("buyerPhone")} />
          </div>
          <div>
            <Label>Montant proposé (FCFA)</Label>
            <Input type="number" {...offerForm.register("offerAmount", { required: true, valueAsNumber: true })} />
          </div>
          <Button type="submit" className="w-full" loading={offerMutation.isPending}>
            Enregistrer l&apos;offre
          </Button>
        </form>
      </Modal>

      <Modal open={finalizeModalOpen} onClose={() => setFinalizeModalOpen(false)} title="Finaliser la vente">
        <form onSubmit={finalizeForm.handleSubmit((v) => finalizeMutation.mutate(v))} className="space-y-3">
          <div>
            <Label>Nom de l&apos;acheteur</Label>
            <Input {...finalizeForm.register("buyerName", { required: true })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...finalizeForm.register("buyerPhone")} />
          </div>
          <div>
            <Label>Prix de vente final (FCFA)</Label>
            <Input type="number" {...finalizeForm.register("finalPrice", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <Label>Date de vente</Label>
            <Input type="date" {...finalizeForm.register("saleDate")} />
          </div>
          <p className="text-xs text-ink-muted">Le bien sera automatiquement archivé des biens actifs une fois la vente finalisée.</p>
          <Button type="submit" className="w-full" loading={finalizeMutation.isPending}>
            Finaliser la vente
          </Button>
        </form>
      </Modal>
    </Card>
  );
}
