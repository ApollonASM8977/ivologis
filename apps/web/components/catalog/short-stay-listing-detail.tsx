"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPin, CalendarCheck } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";

interface RequestForm {
  checkIn: string;
  checkOut: string;
  guestPhone?: string;
  notes?: string;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function ShortStayListingDetail({ id }: { id: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const { register, handleSubmit, reset } = useForm<RequestForm>();

  const { data: property, isLoading } = useQuery({
    queryKey: ["catalog", "short-stay", id],
    queryFn: async () => (await api.get(`/catalog/short-stay/${id}`)).data,
  });

  const mutation = useMutation({
    mutationFn: (values: RequestForm) => api.post(`/properties/${id}/short-stay-bookings/request`, values),
    onSuccess: () => {
      toast.success("Demande de réservation envoyée. Vous serez prévenu dès confirmation.");
      setModalOpen(false);
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !property) return <LoadingState />;

  const bookings: any[] = property.shortStayBookings ?? [];
  const monthLabel = monthCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const firstDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), i + 1)),
  ];

  function dayState(day: Date) {
    for (const b of bookings) {
      const ci = new Date(b.checkIn);
      ci.setHours(0, 0, 0, 0);
      const co = new Date(b.checkOut);
      co.setHours(0, 0, 0, 0);
      if (day >= ci && day < co) return b.status === "CONFIRMEE" ? "booked" : "pending";
    }
    return "free";
  }

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </button>

      {!!property.images?.length && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {property.images.map((img: any) => (
            <div key={img.id} className="relative h-28 overflow-hidden rounded-lg bg-gray-100">
              <Image src={fileUrl(img.url) ?? ""} alt={property.name} fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{property.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" /> {property.address}, {property.commune}
          </p>
        </div>
        <p className="text-2xl font-bold text-primary">{formatXOF(Number(property.shortStayNightlyRate ?? 0))}/nuit</p>
      </div>

      {property.description && (
        <Card className="mt-4">
          <CardHeader title="Description" />
          <p className="text-sm leading-relaxed text-ink-muted">{property.description}</p>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader title="Disponibilités" />
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded p-1 text-ink-muted hover:bg-gray-100">
            ‹
          </button>
          <p className="text-sm font-medium capitalize text-ink">{monthLabel}</p>
          <button type="button" onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded p-1 text-ink-muted hover:bg-gray-100">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1 font-semibold text-ink-muted">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const state = day ? dayState(day) : "free";
            return (
              <div
                key={i}
                className={`flex h-8 items-center justify-center rounded-md text-xs ${
                  !day ? "" : state === "booked" ? "bg-danger/80 text-white" : state === "pending" ? "bg-warning/70 text-white" : "bg-gray-50 text-ink"
                }`}
              >
                {day ? day.getDate() : ""}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/80" /> Réservé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" /> Demande en attente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-200" /> Libre
          </span>
        </div>
      </Card>

      <Button className="mt-6" onClick={() => setModalOpen(true)}>
        <CalendarCheck className="h-4 w-4" /> Demander une réservation
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Demande de réservation">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
          <p className="text-sm text-ink-muted">
            Vous recevrez une confirmation une fois la demande validée par l&apos;agence ou le propriétaire. Le paiement n&apos;est pas en ligne : les modalités vous seront communiquées à la confirmation.
          </p>
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
          <div>
            <Label>Téléphone (optionnel)</Label>
            <Input {...register("guestPhone")} />
          </div>
          <div>
            <Label>Message (optionnel)</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Envoyer la demande
          </Button>
        </form>
      </Modal>
    </div>
  );
}
