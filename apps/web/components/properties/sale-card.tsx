"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Check, X as XIcon, Tag, FileUp, Eye, MessageSquare, Trash2, CalendarCheck } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import {
  formatXOF,
  SALE_STATUS_LABELS,
  SALE_STATUS_COLORS,
  SALE_OFFER_STATUS_LABELS,
  SALE_DOCUMENT_TYPE_LABELS,
  VISIT_REQUEST_STATUS_LABELS,
  VISIT_REQUEST_STATUS_COLORS,
} from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
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
interface DocumentForm {
  type: string;
  label?: string;
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
  const documentFileRef = useRef<HTMLInputElement>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [scheduleVisitId, setScheduleVisitId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  const invalidateProperty = () => {
    queryClient.invalidateQueries({ queryKey: ["properties", propertyId] });
    queryClient.invalidateQueries({ queryKey: ["sale-offers", propertyId] });
    queryClient.invalidateQueries({ queryKey: ["sale-documents", propertyId] });
    queryClient.invalidateQueries({ queryKey: ["visit-requests", propertyId] });
  };

  const { data: offers } = useQuery({
    queryKey: ["sale-offers", propertyId],
    queryFn: async () => (await api.get(`/properties/${propertyId}/sale-offers`)).data,
    enabled: !!property?.forSale,
  });

  const { data: documents } = useQuery({
    queryKey: ["sale-documents", propertyId],
    queryFn: async () => (await api.get(`/properties/${propertyId}/sale-documents`)).data,
    enabled: !!property?.forSale,
  });

  const { data: visitRequests } = useQuery({
    queryKey: ["visit-requests", propertyId],
    queryFn: async () => (await api.get(`/properties/${propertyId}/visit-requests`)).data,
    enabled: !!property?.forSale,
  });

  const listForm = useForm<ListForSaleForm>({ defaultValues: { salePrice: property?.salePrice ?? undefined, saleCommissionRate: property?.saleCommissionRate ?? undefined } });
  const offerForm = useForm<OfferForm>();
  const finalizeForm = useForm<FinalizeForm>();
  const documentForm = useForm<DocumentForm>({ defaultValues: { type: "MUTATION" } });

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
    mutationFn: async ({ file, values }: { file: File; values: DocumentForm }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("type", values.type);
      if (values.label) form.append("label", values.label);
      return (await api.post(`/properties/${propertyId}/sale-documents`, form)).data;
    },
    onSuccess: () => {
      toast.success("Document ajouté.");
      invalidateProperty();
      setDocumentModalOpen(false);
      documentForm.reset({ type: "MUTATION" });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => api.delete(`/sale-documents/${documentId}`),
    onSuccess: () => {
      toast.success("Document supprimé.");
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decideVisitMutation = useMutation({
    mutationFn: ({ id, accept, scheduledDate: date }: { id: string; accept: boolean; scheduledDate?: string }) =>
      api.patch(`/visit-requests/${id}/${accept ? "confirm" : "refuse"}`, accept ? { scheduledDate: date || undefined } : undefined),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? "Visite confirmée." : "Demande refusée.");
      invalidateProperty();
      setScheduleVisitId(null);
      setScheduledDate("");
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

      <div className="mb-4 flex items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {property.viewCount ?? 0} vue(s)</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {property.inquiryCount ?? 0} demande(s)</span>
      </div>

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
              <Button size="sm" variant="secondary" onClick={() => setDocumentModalOpen(true)}>
                <FileUp className="h-4 w-4" /> Ajouter un document
              </Button>
              <Button size="sm" onClick={() => setFinalizeModalOpen(true)}>
                Finaliser la vente
              </Button>
              <Button size="sm" variant="ghost" onClick={() => unlistMutation.mutate()} loading={unlistMutation.isPending}>
                Retirer de la vente
              </Button>
            </div>
          )}

          <p className="mb-1 text-xs font-semibold uppercase text-ink-muted">Offres reçues</p>
          <div className="mb-4 space-y-2">
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

      <p className="mb-1 mt-4 text-xs font-semibold uppercase text-ink-muted">Demandes de visite</p>
      <div className="mb-4 space-y-2">
        {!visitRequests?.length ? (
          <p className="text-sm text-ink-muted">Aucune demande de visite pour l&apos;instant.</p>
        ) : (
          visitRequests.map((v: any) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{v.user?.fullName}</p>
                <p className="truncate text-xs text-ink-muted">
                  {v.user?.phone ?? v.user?.email}
                  {v.preferredDate && ` · souhaité le ${new Date(v.preferredDate).toLocaleDateString("fr-FR")}`}
                  {v.scheduledDate && ` · RDV fixé le ${new Date(v.scheduledDate).toLocaleDateString("fr-FR")}`}
                </p>
                {v.message && <p className="truncate text-xs text-ink-muted">« {v.message} »</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge color={VISIT_REQUEST_STATUS_COLORS[v.status as keyof typeof VISIT_REQUEST_STATUS_COLORS]}>
                  {VISIT_REQUEST_STATUS_LABELS[v.status as keyof typeof VISIT_REQUEST_STATUS_LABELS]}
                </Badge>
                {v.status === "EN_ATTENTE" && (
                  <>
                    <button
                      type="button"
                      title="Confirmer / fixer le RDV"
                      className="rounded p-1 text-success hover:bg-success/10"
                      onClick={() => {
                        setScheduleVisitId(v.id);
                        setScheduledDate(v.preferredDate ? new Date(v.preferredDate).toISOString().slice(0, 10) : "");
                      }}
                    >
                      <CalendarCheck className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Refuser"
                      className="rounded p-1 text-danger hover:bg-danger/10"
                      onClick={() => decideVisitMutation.mutate({ id: v.id, accept: false })}
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

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-ink-muted">Documents de vente</p>
        {canManage && (
          <button type="button" onClick={() => setDocumentModalOpen(true)} className="text-xs font-medium text-primary hover:underline">
            + Ajouter
          </button>
        )}
      </div>
      <div className="mt-1 space-y-2">
        {!documents?.length ? (
          <p className="text-sm text-ink-muted">Aucun document ajouté pour l&apos;instant.</p>
        ) : (
          documents.map((d: any) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <div className="min-w-0">
                <DocumentLink path={d.url} className="truncate font-medium text-primary hover:underline">
                  {d.label || SALE_DOCUMENT_TYPE_LABELS[d.type as keyof typeof SALE_DOCUMENT_TYPE_LABELS]}
                </DocumentLink>
                <p className="truncate text-xs text-ink-muted">{SALE_DOCUMENT_TYPE_LABELS[d.type as keyof typeof SALE_DOCUMENT_TYPE_LABELS]}</p>
              </div>
              {canManage && (
                <button
                  type="button"
                  title="Supprimer"
                  className="rounded p-1 text-danger hover:bg-danger/10"
                  onClick={() => deleteDocumentMutation.mutate(d.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

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

      <Modal open={documentModalOpen} onClose={() => setDocumentModalOpen(false)} title="Ajouter un document de vente">
        <form
          onSubmit={documentForm.handleSubmit((values) => {
            const file = documentFileRef.current?.files?.[0];
            if (!file) {
              toast.error("Veuillez sélectionner un fichier.");
              return;
            }
            documentMutation.mutate({ file, values });
          })}
          className="space-y-3"
        >
          <div>
            <Label>Type de document</Label>
            <Select {...documentForm.register("type", { required: true })}>
              {Object.entries(SALE_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Libellé (optionnel)</Label>
            <Input {...documentForm.register("label")} placeholder="Ex : Acte notarié n°..." />
          </div>
          <div>
            <Label>Fichier</Label>
            <input ref={documentFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="block w-full text-sm" />
          </div>
          <Button type="submit" className="w-full" loading={documentMutation.isPending}>
            Ajouter le document
          </Button>
        </form>
      </Modal>

      <Modal open={!!scheduleVisitId} onClose={() => setScheduleVisitId(null)} title="Confirmer la visite">
        <div className="space-y-3">
          <div>
            <Label>Date du rendez-vous (optionnel)</Label>
            <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>
          <Button
            className="w-full"
            loading={decideVisitMutation.isPending}
            onClick={() => scheduleVisitId && decideVisitMutation.mutate({ id: scheduleVisitId, accept: true, scheduledDate })}
          >
            Confirmer la visite
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
