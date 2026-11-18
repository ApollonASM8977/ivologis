"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, Check, X as XIcon, Wallet } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { SHORT_STAY_STATUS_LABELS, SHORT_STAY_STATUS_COLORS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentLink } from "@/components/document-link";
import { t } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";
import { invalidForm } from "@/lib/form";

interface BookingForm {
  guestName: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  nightlyRate: number;
  depositAmount?: number;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function ShortStayCard({
  propertyId,
  defaultNightlyRate,
  canManage = true,
  approved = false,
}: {
  propertyId: string;
  defaultNightlyRate?: number;
  canManage?: boolean;
  approved?: boolean;
}) {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const isStaff = role === "SUPER_ADMIN" || role === "ADMIN_AGENT";
  const approveMutation = useMutation({
    mutationFn: (value: boolean) => api.patch(`/properties/${propertyId}`, { shortStayApproved: value }),
    onSuccess: (_res, value) => {
      toast.success(value ? t("Annonce publiée dans le catalogue.") : t("Annonce retirée du catalogue."));
      queryClient.invalidateQueries({ queryKey: ["properties", propertyId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["short-stay-bookings", propertyId],
    queryFn: async () => (await api.get(`/properties/${propertyId}/short-stay-bookings`)).data,
  });

  const { register, handleSubmit, reset } = useForm<BookingForm>({
    defaultValues: { nightlyRate: defaultNightlyRate },
  });

  const createMutation = useMutation({
    mutationFn: (values: BookingForm) => api.post(`/properties/${propertyId}/short-stay-bookings`, values),
    onSuccess: () => {
      toast.success(t("Réservation créée."));
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
      setModalOpen(false);
      reset({ nightlyRate: defaultNightlyRate });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/short-stay-bookings/${id}/cancel`),
    onSuccess: () => {
      toast.success(t("Réservation annulée."));
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
      setCancelId(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/short-stay-bookings/${id}/complete`),
    onSuccess: () => {
      toast.success(t("Séjour clôturé, quittance générée."));
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
      setCompleteId(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => api.patch(`/short-stay-bookings/${id}/${accept ? "confirm" : "refuse"}`),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? t("Demande confirmée.") : t("Demande refusée."));
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) => api.patch(`/short-stay-bookings/${id}/mark-paid`, { isPaid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const list: any[] = bookings ?? [];
  const confirmed = list.filter((b) => b.status === "CONFIRMEE");
  const pending = list.filter((b) => b.status === "EN_ATTENTE");

  const monthLabel = monthCursor.toLocaleDateString(locale(), { month: "long", year: "numeric" });
  const firstDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), i + 1)),
  ];

  function overlapsDay(bookingsList: any[], day: Date) {
    return bookingsList.some((b) => {
      const ci = new Date(b.checkIn);
      ci.setHours(0, 0, 0, 0);
      const co = new Date(b.checkOut);
      co.setHours(0, 0, 0, 0);
      return day >= ci && day < co;
    });
  }

  return (
    <Card className="mt-4">
      <CardHeader
        title={t("Location courte durée")}
        action={
          canManage ? (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />{" "}{t("Nouvelle réservation")}
            </Button>
          ) : undefined
        }
      />

      <div
        className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${approved ? "bg-success/10 text-green-900" : "bg-amber-50 text-amber-950"}`}
      >
        <span>
          {approved
            ? t("Publiée dans le catalogue public.")
            : t("En attente de validation par l'agence : cette résidence n'apparaît pas encore dans le catalogue public.")}
        </span>
        {isStaff && (
          <Button size="sm" variant={approved ? "secondary" : "primary"} loading={approveMutation.isPending} onClick={() => approveMutation.mutate(!approved)}>
            {approved ? t("Retirer du catalogue") : t("Valider la publication")}
          </Button>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="rounded p-1 text-ink-muted hover:bg-gray-100"
          aria-label={t("Mois précédent")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium capitalize text-ink">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="rounded p-1 text-ink-muted hover:bg-gray-100"
          aria-label={t("Mois suivant")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1 font-semibold text-ink-muted">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const state = !day ? null : overlapsDay(confirmed, day) ? "confirmed" : overlapsDay(pending, day) ? "pending" : "free";
          return (
            <div
              key={i}
              className={`flex h-8 items-center justify-center rounded-md text-xs ${
                state === "confirmed"
                  ? "bg-primary font-medium text-white"
                  : state === "pending"
                    ? "border border-warning bg-warning/10 text-ink"
                    : state === "free"
                      ? "bg-gray-50 text-ink"
                      : ""
              }`}
            >
              {day ? day.getDate() : ""}
            </div>
          );
        })}
      </div>
      <p className="mb-5 mt-2 flex items-center gap-3 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />{" "}{t("Confirmée")}</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-warning bg-warning/10" />{" "}{t("Demande en attente")}</span>
      </p>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <p className="text-sm text-ink-muted">{t("Chargement...")}</p>
        ) : !list.length ? (
          <p className="text-sm text-ink-muted">{t("Aucune réservation pour ce bien.")}</p>
        ) : (
          list.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {b.guestName}
                  {!b.requestedByUserId && b.status === "EN_ATTENTE" && (
                    <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">{t("invité")}</span>
                  )}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {new Date(b.checkIn).toLocaleDateString(locale())} → {new Date(b.checkOut).toLocaleDateString(locale())}, {money(Number(b.totalAmount))}
                  {b.guestPhone && ` · ${b.guestPhone}`}
                  {t(" · réf. ")}{b.reference}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge color={SHORT_STAY_STATUS_COLORS[b.status as keyof typeof SHORT_STAY_STATUS_COLORS]}>
                  {t(SHORT_STAY_STATUS_LABELS[b.status as keyof typeof SHORT_STAY_STATUS_LABELS])}
                </Badge>
                {b.receiptUrl && (
                  <DocumentLink path={b.receiptUrl} className="text-xs font-medium text-primary hover:underline">
                    {t("Quittance")}
                  </DocumentLink>
                )}
                {isStaff && b.status === "EN_ATTENTE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => decideMutation.mutate({ id: b.id, accept: true })}
                      title={t("Confirmer la demande")}
                      className="rounded p-1 text-success hover:bg-success/10"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => decideMutation.mutate({ id: b.id, accept: false })}
                      title={t("Refuser la demande")}
                      className="rounded p-1 text-danger hover:bg-danger/10"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                {canManage && b.status === "CONFIRMEE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => markPaidMutation.mutate({ id: b.id, isPaid: !b.isPaid })}
                      title={b.isPaid ? t("Marquer comme non payé") : t("Marquer comme payé")}
                      className={`rounded p-1 hover:bg-gray-100 ${b.isPaid ? "text-success" : "text-ink-muted"}`}
                    >
                      <Wallet className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompleteId(b.id)}
                      title={t("Clôturer le séjour")}
                      className="rounded p-1 text-success hover:bg-success/10"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelId(b.id)}
                      title={t("Annuler")}
                      className="rounded p-1 text-danger hover:bg-danger/10"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                {!canManage && b.status === "CONFIRMEE" && b.isPaid && (
                  <Badge color="green">{t("Payé")}</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("Nouvelle réservation")}>
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v), invalidForm)} className="space-y-3">
          <div>
            <Label>{t("Nom du voyageur")}</Label>
            <Input {...register("guestName", { required: true })} />
          </div>
          <div>
            <Label>{t("Téléphone")}</Label>
            <Input {...register("guestPhone")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("Arrivée")}</Label>
              <Input type="date" {...register("checkIn", { required: true })} />
            </div>
            <div>
              <Label>{t("Départ")}</Label>
              <Input type="date" {...register("checkOut", { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("Tarif par nuitée (FCFA)")}</Label>
              <Input type="number" {...register("nightlyRate", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label>{t("Dépôt de garantie (FCFA)")}</Label>
              <Input type="number" {...register("depositAmount", { valueAsNumber: true })} />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={createMutation.isPending}>
            {t("Créer la réservation")}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!cancelId}
        title={t("Annuler la réservation")}
        message={t("Cette réservation sera annulée et les dates redeviendront disponibles. Continuer ?")}
        danger
        loading={cancelMutation.isPending}
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
        onClose={() => setCancelId(null)}
      />
      <ConfirmDialog
        open={!!completeId}
        title={t("Clôturer le séjour")}
        message={t("Le séjour sera marqué comme terminé et une quittance sera générée automatiquement. Continuer ?")}
        loading={completeMutation.isPending}
        onConfirm={() => completeId && completeMutation.mutate(completeId)}
        onClose={() => setCompleteId(null)}
      />
    </Card>
  );
}
