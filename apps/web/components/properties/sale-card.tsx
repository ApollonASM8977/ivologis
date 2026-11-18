"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Check, X as XIcon, Tag, FileUp, Eye, MessageSquare, Trash2, CalendarCheck, Pencil, ShieldCheck } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { SALE_STATUS_LABELS, SALE_STATUS_COLORS, SALE_OFFER_STATUS_LABELS, SALE_DOCUMENT_TYPE_LABELS, VISIT_REQUEST_STATUS_LABELS, VISIT_REQUEST_STATUS_COLORS, LAND_TITLE_TYPE_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentLink } from "@/components/document-link";
import { t } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";
import { invalidForm } from "@/lib/form";

interface ListForSaleForm {
  salePrice: number;
  saleCommissionRate?: number;
  landTitleType?: string;
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

  const listForm = useForm<ListForSaleForm>({
    defaultValues: { salePrice: property?.salePrice ?? undefined, saleCommissionRate: property?.saleCommissionRate ?? undefined, landTitleType: property?.landTitleType ?? "AUTRE" },
  });
  const offerForm = useForm<OfferForm>();
  const finalizeForm = useForm<FinalizeForm>();
  const documentForm = useForm<DocumentForm>({ defaultValues: { type: "MUTATION" } });

  const listMutation = useMutation({
    mutationFn: (values: ListForSaleForm) => api.patch(`/properties/${propertyId}/sale`, { forSale: true, ...values }),
    onSuccess: () => {
      toast.success(t("Bien mis en vente."));
      invalidateProperty();
      setListModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const unlistMutation = useMutation({
    mutationFn: () => api.patch(`/properties/${propertyId}/sale`, { forSale: false }),
    onSuccess: () => {
      toast.success(t("Bien retiré de la vente."));
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const verifyMutation = useMutation({
    mutationFn: (verified: boolean) =>
      api.patch(`/properties/${propertyId}/sale`, {
        forSale: true,
        salePrice: property?.salePrice,
        saleCommissionRate: property?.saleCommissionRate,
        landTitleType: property?.landTitleType ?? "AUTRE",
        landTitleVerified: verified,
      }),
    onSuccess: () => {
      toast.success(t("Statut de vérification mis à jour."));
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const offerMutation = useMutation({
    mutationFn: (values: OfferForm) => api.post(`/properties/${propertyId}/sale-offers`, values),
    onSuccess: () => {
      toast.success(t("Offre enregistrée."));
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
      toast.success(t("Document ajouté."));
      invalidateProperty();
      setDocumentModalOpen(false);
      documentForm.reset({ type: "MUTATION" });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => api.delete(`/sale-documents/${documentId}`),
    onSuccess: () => {
      toast.success(t("Document supprimé."));
      invalidateProperty();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decideVisitMutation = useMutation({
    mutationFn: ({ id, accept, scheduledDate: date }: { id: string; accept: boolean; scheduledDate?: string }) =>
      api.patch(`/visit-requests/${id}/${accept ? "confirm" : "refuse"}`, accept ? { scheduledDate: date || undefined } : undefined),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? t("Visite confirmée.") : t("Demande refusée."));
      invalidateProperty();
      setScheduleVisitId(null);
      setScheduledDate("");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const finalizeMutation = useMutation({
    mutationFn: (values: FinalizeForm) => api.post(`/properties/${propertyId}/finalize-sale`, values),
    onSuccess: () => {
      toast.success(t("Vente finalisée. Le bien est archivé des biens actifs."));
      invalidateProperty();
      setFinalizeModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!property?.forSale) {
    if (!canManage) return null;
    return (
      <Card className="mt-4">
        <CardHeader title={t("Vente")} />
        <p className="mb-3 text-sm text-ink-muted">{t("Ce bien n'est pas actuellement en vente.")}</p>
        <Button size="sm" variant="secondary" onClick={() => setListModalOpen(true)}>
          <Tag className="h-4 w-4" />{" "}{t("Mettre en vente")}
        </Button>

        <Modal open={listModalOpen} onClose={() => setListModalOpen(false)} title={t("Mettre ce bien en vente")}>
          <form onSubmit={listForm.handleSubmit((v) => listMutation.mutate(v), invalidForm)} className="space-y-3">
            <div>
              <Label>{t("Prix de vente demandé (FCFA)")}</Label>
              <Input type="number" {...listForm.register("salePrice", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label>{t("Commission de vente (%)")}</Label>
              <Input type="number" step="0.1" {...listForm.register("saleCommissionRate", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>{t("Type de titre foncier")}</Label>
              <Select {...listForm.register("landTitleType")}>
                {Object.entries(LAND_TITLE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-ink-muted">{t("Le bien n'apparaîtra dans le catalogue public qu'une fois le titre vérifié par l'agence.")}</p>
            </div>
            <Button type="submit" className="w-full" loading={listMutation.isPending}>
              {t("Mettre en vente")}
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
        title={t("Vente")}
        action={<Badge color={SALE_STATUS_COLORS[property.saleStatus as keyof typeof SALE_STATUS_COLORS]}>{t(SALE_STATUS_LABELS[property.saleStatus as keyof typeof SALE_STATUS_LABELS])}</Badge>}
      />

      <div className="mb-4 flex items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{" "}{t("{0} vue(s)", property.viewCount ?? 0)}</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{" "}{t("{0} demande(s)", property.inquiryCount ?? 0)}</span>
      </div>

      {isSold ? (
        <div className="space-y-1 text-sm">
          <p className="text-ink">
            {t("Vendu à")}{" "}<span className="font-medium">{property.saleBuyerName}</span> le{" "}
            {property.saleDate ? new Date(property.saleDate).toLocaleDateString(locale()) : "-"}
          </p>
          <p className="font-semibold text-success">{money(Number(property.saleFinalPrice))}</p>
          {property.saleDocumentUrl && (
            <DocumentLink path={property.saleDocumentUrl} className="text-sm font-medium text-primary hover:underline">
              {t("Voir l'acte / compromis")}
            </DocumentLink>
          )}
        </div>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase text-ink-muted">{t("Prix demandé")}</p>
              <p className="font-semibold text-ink">{money(Number(property.salePrice ?? 0))}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-muted">{t("Commission")}</p>
              <p className="font-semibold text-ink">{property.saleCommissionRate ? `${property.saleCommissionRate}%` : "-"}</p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge color={property.landTitleVerified ? "green" : "amber"}>
              {LAND_TITLE_TYPE_LABELS[property.landTitleType as keyof typeof LAND_TITLE_TYPE_LABELS] ?? t("Titre non précisé")}
              {property.landTitleVerified ? t(" · vérifié") : t(" · non vérifié")}
            </Badge>
            {!property.landTitleVerified && !canManage && (
              <span className="text-xs text-ink-muted">{t("Invisible du catalogue public tant que l'agence n'a pas vérifié le titre.")}</span>
            )}
            {canManage && (
              <button
                type="button"
                onClick={() => verifyMutation.mutate(!property.landTitleVerified)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${property.landTitleVerified ? "border-success text-success hover:bg-success/10" : "border-primary text-primary hover:bg-primary/10"}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {property.landTitleVerified ? t("Retirer la vérification") : t("Marquer le titre comme vérifié")}
              </button>
            )}
          </div>

          {canManage && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  listForm.reset({ salePrice: property.salePrice, saleCommissionRate: property.saleCommissionRate, landTitleType: property.landTitleType ?? "AUTRE" });
                  setListModalOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />{" "}{t("Modifier l'annonce")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setOfferModalOpen(true)}>
                <Plus className="h-4 w-4" />{" "}{t("Ajouter une offre")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setDocumentModalOpen(true)}>
                <FileUp className="h-4 w-4" />{" "}{t("Ajouter un document")}
              </Button>
              <Button size="sm" onClick={() => setFinalizeModalOpen(true)}>
                {t("Finaliser la vente")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => unlistMutation.mutate()} loading={unlistMutation.isPending}>
                {t("Retirer de la vente")}
              </Button>
            </div>
          )}

          <p className="mb-1 text-xs font-semibold uppercase text-ink-muted">{t("Offres reçues")}</p>
          <div className="mb-4 space-y-2">
            {!offers?.length ? (
              <p className="text-sm text-ink-muted">{t("Aucune offre reçue pour l'instant.")}</p>
            ) : (
              offers.map((o: any) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{o.buyerName}</p>
                    <p className="truncate text-xs text-ink-muted">{o.buyerPhone} · {money(Number(o.offerAmount))}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge color={o.status === "ACCEPTEE" ? "green" : o.status === "REFUSEE" ? "red" : "amber"}>
                      {t(SALE_OFFER_STATUS_LABELS[o.status as keyof typeof SALE_OFFER_STATUS_LABELS])}
                    </Badge>
                    {canManage && o.status === "EN_ATTENTE" && (
                      <>
                        <button
                          type="button"
                          title={t("Accepter")}
                          className="rounded p-1 text-success hover:bg-success/10"
                          onClick={() => offerStatusMutation.mutate({ offerId: o.id, accept: true })}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title={t("Refuser")}
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

      <p className="mb-1 mt-4 text-xs font-semibold uppercase text-ink-muted">{t("Demandes de visite")}</p>
      <div className="mb-4 space-y-2">
        {!visitRequests?.length ? (
          <p className="text-sm text-ink-muted">{t("Aucune demande de visite pour l'instant.")}</p>
        ) : (
          visitRequests.map((v: any) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {v.user?.fullName ?? v.guestName}
                  {!v.user && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">{t("invité")}</span>}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {canManage ? v.user?.phone ?? v.user?.email ?? v.guestPhone ?? v.guestEmail : t("Suivi par l'agence")}
                  {v.preferredDate && t(" · souhaité le {0}", new Date(v.preferredDate).toLocaleDateString(locale()))}
                  {v.scheduledDate && t(" · RDV fixé le {0}", new Date(v.scheduledDate).toLocaleDateString(locale()))}
                  {t(" · réf. ")}{v.reference}
                </p>
                {v.message && <p className="truncate text-xs text-ink-muted">« {v.message} »</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge color={VISIT_REQUEST_STATUS_COLORS[v.status as keyof typeof VISIT_REQUEST_STATUS_COLORS]}>
                  {t(VISIT_REQUEST_STATUS_LABELS[v.status as keyof typeof VISIT_REQUEST_STATUS_LABELS])}
                </Badge>
                {canManage && v.status === "EN_ATTENTE" && (
                  <>
                    <button
                      type="button"
                      title={t("Confirmer / fixer le RDV")}
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
                      title={t("Refuser")}
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
        <p className="text-xs font-semibold uppercase text-ink-muted">{t("Documents de vente")}</p>
        {canManage && (
          <button type="button" onClick={() => setDocumentModalOpen(true)} className="text-xs font-medium text-primary hover:underline">
            {t("+ Ajouter")}
          </button>
        )}
      </div>
      <div className="mt-1 space-y-2">
        {!documents?.length ? (
          <p className="text-sm text-ink-muted">{t("Aucun document ajouté pour l'instant.")}</p>
        ) : (
          documents.map((d: any) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <div className="min-w-0">
                <DocumentLink path={d.url} className="truncate font-medium text-primary hover:underline">
                  {d.label || SALE_DOCUMENT_TYPE_LABELS[d.type as keyof typeof SALE_DOCUMENT_TYPE_LABELS]}
                </DocumentLink>
                <p className="truncate text-xs text-ink-muted">{t(SALE_DOCUMENT_TYPE_LABELS[d.type as keyof typeof SALE_DOCUMENT_TYPE_LABELS])}</p>
              </div>
              {canManage && (
                <button
                  type="button"
                  title={t("Supprimer")}
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

      <Modal open={listModalOpen} onClose={() => setListModalOpen(false)} title={t("Modifier l'annonce")}>
        <form onSubmit={listForm.handleSubmit((v) => listMutation.mutate(v), invalidForm)} className="space-y-3">
          <div>
            <Label>{t("Prix de vente demandé (FCFA)")}</Label>
            <Input type="number" {...listForm.register("salePrice", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <Label>{t("Commission de vente (%)")}</Label>
            <Input type="number" step="0.1" {...listForm.register("saleCommissionRate", { valueAsNumber: true })} />
          </div>
          <div>
            <Label>{t("Type de titre foncier")}</Label>
            <Select {...listForm.register("landTitleType")}>
              {Object.entries(LAND_TITLE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="w-full" loading={listMutation.isPending}>
            {t("Enregistrer")}
          </Button>
        </form>
      </Modal>

      <Modal open={offerModalOpen} onClose={() => setOfferModalOpen(false)} title={t("Ajouter une offre")}>
        <form onSubmit={offerForm.handleSubmit((v) => offerMutation.mutate(v), invalidForm)} className="space-y-3">
          <div>
            <Label>{t("Nom de l'acheteur")}</Label>
            <Input {...offerForm.register("buyerName", { required: true })} />
          </div>
          <div>
            <Label>{t("Téléphone")}</Label>
            <Input {...offerForm.register("buyerPhone")} />
          </div>
          <div>
            <Label>{t("Montant proposé (FCFA)")}</Label>
            <Input type="number" {...offerForm.register("offerAmount", { required: true, valueAsNumber: true })} />
          </div>
          <Button type="submit" className="w-full" loading={offerMutation.isPending}>
            {t("Enregistrer l'offre")}
          </Button>
        </form>
      </Modal>

      <Modal open={finalizeModalOpen} onClose={() => setFinalizeModalOpen(false)} title={t("Finaliser la vente")}>
        <form onSubmit={finalizeForm.handleSubmit((v) => finalizeMutation.mutate(v), invalidForm)} className="space-y-3">
          <div>
            <Label>{t("Nom de l'acheteur")}</Label>
            <Input {...finalizeForm.register("buyerName", { required: true })} />
          </div>
          <div>
            <Label>{t("Téléphone")}</Label>
            <Input {...finalizeForm.register("buyerPhone")} />
          </div>
          <div>
            <Label>{t("Prix de vente final (FCFA)")}</Label>
            <Input type="number" {...finalizeForm.register("finalPrice", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <Label>{t("Date de vente")}</Label>
            <Input type="date" {...finalizeForm.register("saleDate")} />
          </div>
          <p className="text-xs text-ink-muted">{t("Le bien sera automatiquement archivé des biens actifs une fois la vente finalisée.")}</p>
          <Button type="submit" className="w-full" loading={finalizeMutation.isPending}>
            {t("Finaliser la vente")}
          </Button>
        </form>
      </Modal>

      <Modal open={documentModalOpen} onClose={() => setDocumentModalOpen(false)} title={t("Ajouter un document de vente")}>
        <form
          onSubmit={documentForm.handleSubmit((values) => {
            const file = documentFileRef.current?.files?.[0];
            if (!file) {
              toast.error(t("Veuillez sélectionner un fichier."));
              return;
            }
            documentMutation.mutate({ file, values });
          })}
          className="space-y-3"
        >
          <div>
            <Label>{t("Type de document")}</Label>
            <Select {...documentForm.register("type", { required: true })}>
              {Object.entries(SALE_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("Libellé (optionnel)")}</Label>
            <Input {...documentForm.register("label")} placeholder={t("Ex : Acte notarié n°...")} />
          </div>
          <div>
            <Label>{t("Fichier")}</Label>
            <input ref={documentFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="block w-full text-sm" />
          </div>
          <Button type="submit" className="w-full" loading={documentMutation.isPending}>
            {t("Ajouter le document")}
          </Button>
        </form>
      </Modal>

      <Modal open={!!scheduleVisitId} onClose={() => setScheduleVisitId(null)} title={t("Confirmer la visite")}>
        <div className="space-y-3">
          <div>
            <Label>{t("Date du rendez-vous (optionnel)")}</Label>
            <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>
          <Button
            className="w-full"
            loading={decideVisitMutation.isPending}
            onClick={() => scheduleVisitId && decideVisitMutation.mutate({ id: scheduleVisitId, accept: true, scheduledDate })}
          >
            {t("Confirmer la visite")}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
