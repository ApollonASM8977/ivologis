"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, Check, X as XIcon, Wallet } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatXOF, SHORT_STAY_STATUS_LABELS, SHORT_STAY_STATUS_COLORS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentLink } from "@/components/document-link";

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
}: {
  propertyId: string;
  defaultNightlyRate?: number;
  canManage?: boolean;
}) {
  const queryClient = useQueryClient();
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
      toast.success("Réservation créée.");
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
      setModalOpen(false);
      reset({ nightlyRate: defaultNightlyRate });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/short-stay-bookings/${id}/cancel`),
    onSuccess: () => {
      toast.success("Réservation annulée.");
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
      setCancelId(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/short-stay-bookings/${id}/complete`),
    onSuccess: () => {
      toast.success("Séjour clôturé, quittance générée.");
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings", propertyId] });
      setCompleteId(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => api.patch(`/short-stay-bookings/${id}/${accept ? "confirm" : "refuse"}`),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? "Demande confirmée." : "Demande refusée.");
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

  const monthLabel = monthCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
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
        title="Location courte durée"
        action={
          canManage ? (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Nouvelle réservation
            </Button>
          ) : undefined
        }
      />

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="rounded p-1 text-ink-muted hover:bg-gray-100"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium capitalize text-ink">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="rounded p-1 text-ink-muted hover:bg-gray-100"
          aria-label="Mois suivant"
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
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Confirmée</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-warning bg-warning/10" /> Demande en attente</span>
      </p>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <p className="text-sm text-ink-muted">Chargement...</p>
        ) : !list.length ? (
          <p className="text-sm text-ink-muted">Aucune réservation pour ce bien.</p>
        ) : (
          list.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{b.guestName}</p>
                <p className="truncate text-xs text-ink-muted">
                  {new Date(b.checkIn).toLocaleDateString("fr-FR")} → {new Date(b.checkOut).toLocaleDateString("fr-FR")}, {formatXOF(Number(b.totalAmount))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge color={SHORT_STAY_STATUS_COLORS[b.status as keyof typeof SHORT_STAY_STATUS_COLORS]}>
                  {SHORT_STAY_STATUS_LABELS[b.status as keyof typeof SHORT_STAY_STATUS_LABELS]}
                </Badge>
                {b.receiptUrl && (
                  <DocumentLink path={b.receiptUrl} className="text-xs font-medium text-primary hover:underline">
                    Quittance
                  </DocumentLink>
                )}
                {b.status === "EN_ATTENTE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => decideMutation.mutate({ id: b.id, accept: true })}
                      title="Confirmer la demande"
                      className="rounded p-1 text-success hover:bg-success/10"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => decideMutation.mutate({ id: b.id, accept: false })}
                      title="Refuser la demande"
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
                      title={b.isPaid ? "Marquer comme non payé" : "Marquer comme payé"}
                      className={`rounded p-1 hover:bg-gray-100 ${b.isPaid ? "text-success" : "text-ink-muted"}`}
                    >
                      <Wallet className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompleteId(b.id)}
                      title="Clôturer le séjour"
                      className="rounded p-1 text-success hover:bg-success/10"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelId(b.id)}
                      title="Annuler"
                      className="rounded p-1 text-danger hover:bg-danger/10"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                {!canManage && b.status === "CONFIRMEE" && b.isPaid && (
                  <Badge color="green">Payé</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle réservation">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-3">
          <div>
            <Label>Nom du voyageur</Label>
            <Input {...register("guestName", { required: true })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...register("guestPhone")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Arrivée</Label>
              <Input type="date" {...register("checkIn", { required: true })} />
            </div>
            <div>
              <Label>Départ</Label>
              <Input type="date" {...register("checkOut", { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tarif par nuitée (FCFA)</Label>
              <Input type="number" {...register("nightlyRate", { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label>Dépôt de garantie (FCFA)</Label>
              <Input type="number" {...register("depositAmount", { valueAsNumber: true })} />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={createMutation.isPending}>
            Créer la réservation
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!cancelId}
        title="Annuler la réservation"
        message="Cette réservation sera annulée et les dates redeviendront disponibles. Continuer ?"
        danger
        loading={cancelMutation.isPending}
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
        onClose={() => setCancelId(null)}
      />
      <ConfirmDialog
        open={!!completeId}
        title="Clôturer le séjour"
        message="Le séjour sera marqué comme terminé et une quittance sera générée automatiquement. Continuer ?"
        loading={completeMutation.isPending}
        onConfirm={() => completeId && completeMutation.mutate(completeId)}
        onClose={() => setCompleteId(null)}
      />
    </Card>
  );
}
