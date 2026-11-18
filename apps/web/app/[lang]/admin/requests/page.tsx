"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Phone, MessageCircle, Check, X as XIcon, CalendarCheck, CalendarRange, Inbox } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { SHORT_STAY_STATUS_COLORS, SHORT_STAY_STATUS_LABELS, VISIT_REQUEST_STATUS_COLORS, VISIT_REQUEST_STATUS_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { t as tr } from "@/lib/t-spaces";
import { locale, money } from "@/lib/t";

type Tab = "visits" | "bookings";
const VISIT_FILTERS = [
  { value: "EN_ATTENTE", label: "À traiter" },
  { value: "CONFIRME", label: "Confirmées" },
  { value: "REFUSE", label: "Refusées" },
  { value: "", label: "Toutes" },
];

const waNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `225${digits}` : digits;
};
const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString(locale(), { day: "2-digit", month: "short" }) : null);

function ContactButtons({ phone, text }: { phone?: string | null; text: string }) {
  if (!phone) return null;
  return (
    <div className="flex gap-1.5">
      <a href={`tel:${phone.replace(/\s/g, "")}`} title={tr("Appeler")} className="rounded-lg border border-gray-200 p-1.5 text-ink-muted hover:border-primary/40 hover:text-primary">
        <Phone className="h-4 w-4" />
      </a>
      <a
        href={`https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        className="rounded-lg border border-gray-200 p-1.5 text-ink-muted hover:border-green-400 hover:text-green-700"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </div>
  );
}

/** Boîte de réception de l'agence : toutes les demandes venues du site public, à traiter au même endroit. */
export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("visits");
  const [status, setStatus] = useState("EN_ATTENTE");

  const visits = useQuery<any[]>({
    queryKey: ["visit-requests", "all", status],
    queryFn: async () => (await api.get("/visit-requests", { params: { status: status || undefined } })).data,
  });
  const pendingVisits = useQuery<any[]>({
    queryKey: ["visit-requests", "all", "EN_ATTENTE"],
    queryFn: async () => (await api.get("/visit-requests", { params: { status: "EN_ATTENTE" } })).data,
  });
  const bookings = useQuery<any[]>({
    queryKey: ["short-stay-bookings", "upcoming"],
    queryFn: async () => (await api.get("/short-stay-bookings/upcoming")).data,
  });
  const pendingBookings = (bookings.data ?? []).filter((b) => b.status === "EN_ATTENTE").length;

  const decideVisit = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => api.patch(`/visit-requests/${id}/${accept ? "confirm" : "refuse"}`, {}),
    onSuccess: (_r, { accept }) => {
      toast.success(accept ? tr("Visite confirmée. Pensez à appeler le client pour fixer l'heure.") : tr("Demande refusée."));
      queryClient.invalidateQueries({ queryKey: ["visit-requests"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
  const decideBooking = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => api.patch(`/short-stay-bookings/${id}/${accept ? "confirm" : "refuse"}`, {}),
    onSuccess: (_r, { accept }) => {
      toast.success(accept ? tr("Réservation confirmée.") : tr("Demande de réservation refusée."));
      queryClient.invalidateQueries({ queryKey: ["short-stay-bookings"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const tabs: { key: Tab; label: string; icon: typeof Inbox; count: number }[] = [
    { key: "visits", label: tr("Demandes de visite"), icon: CalendarCheck, count: pendingVisits.data?.length ?? 0 },
    { key: "bookings", label: tr("Réservations"), icon: CalendarRange, count: pendingBookings },
  ];

  return (
    <div>
      <PageHeader title={tr("Demandes clients")} subtitle={tr("Visites et réservations envoyées depuis le site public, à traiter rapidement")} />

      <div role="tablist" className="mb-5 flex gap-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex items-center gap-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors ${tab === t.key ? "text-primary" : "text-ink-muted hover:text-ink"}`}
          >
            <t.icon className="h-4 w-4" />
            {tr(t.label)}
            <AnimatePresence>
              {t.count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                >
                  {t.count}
                </motion.span>
              )}
            </AnimatePresence>
            {tab === t.key && <motion.span layoutId="requests-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {tab === "visits" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {VISIT_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setStatus(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${status === f.value ? "bg-primary text-white" : "bg-white text-ink-muted ring-1 ring-gray-200 hover:text-ink"}`}
              >
                {tr(f.label)}
              </button>
            ))}
          </div>
          {visits.isLoading ? (
            <LoadingState />
          ) : !visits.data?.length ? (
            <EmptyState icon={Inbox} title={tr("Aucune demande ici")} description={tr("Les demandes de visite envoyées depuis le catalogue apparaîtront ici, avec une notification.")} />
          ) : (
            <StaggerContainer key={status} className="space-y-3">
              {visits.data.map((v) => {
                const name = v.user?.fullName ?? v.guestName;
                const phone = v.user?.phone ?? v.guestPhone;
                return (
                  <StaggerItem key={v.id}>
                    <motion.div whileHover={{ y: -2 }} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">
                          {name}
                          {!v.user && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">{tr("sans compte")}</span>}
                        </p>
                        <p className="mt-0.5 text-sm text-ink-muted">
                          <Link href={`/admin/properties/${v.property.id}`} className="font-medium text-primary hover:underline">
                            {v.property.name}
                          </Link>{" "}
                          · {v.property.commune} · {v.property.forSale ? tr("Vente") : tr("Location")}
                          {v.property.isDemo && tr(" · démo")}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {tr("Reçue le")}{" "}{day(v.createdAt)}
                          {v.preferredDate && tr(" · souhaitée le {0}", day(v.preferredDate))}{" "}{tr("· réf. {0}", v.reference)}
                        </p>
                        {v.message && <p className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-sm text-ink">« {v.message} »</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge color={VISIT_REQUEST_STATUS_COLORS[v.status as keyof typeof VISIT_REQUEST_STATUS_COLORS]}>
                          {tr(VISIT_REQUEST_STATUS_LABELS[v.status as keyof typeof VISIT_REQUEST_STATUS_LABELS])}
                        </Badge>
                        <ContactButtons phone={phone} text={tr("Bonjour {0}, c'est l'agence IVOLOGIS au sujet de votre demande de visite (réf. {1}) pour « {2} ».", name, v.reference, v.property.name)} />
                        {v.status === "EN_ATTENTE" && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => decideVisit.mutate({ id: v.id, accept: true })}
                              disabled={decideVisit.isPending}
                              className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />{" "}{tr("Confirmer")}
                            </button>
                            <button
                              onClick={() => decideVisit.mutate({ id: v.id, accept: false })}
                              disabled={decideVisit.isPending}
                              className="flex items-center gap-1 rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/20 disabled:opacity-50"
                            >
                              <XIcon className="h-3.5 w-3.5" />{" "}{tr("Refuser")}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </>
      )}

      {tab === "bookings" &&
        (bookings.isLoading ? (
          <LoadingState />
        ) : !bookings.data?.length ? (
          <EmptyState icon={CalendarRange} title={tr("Aucune réservation à venir")} description={tr("Les demandes de séjour envoyées depuis le catalogue apparaîtront ici.")} />
        ) : (
          <StaggerContainer className="space-y-3">
            {bookings.data.map((b) => (
              <StaggerItem key={b.id}>
                <motion.div whileHover={{ y: -2 }} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{b.guestName}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      <Link href={`/admin/properties/${b.property.id}`} className="font-medium text-primary hover:underline">
                        {b.property.name}
                      </Link>{" "}
                      · du {day(b.checkIn)} au {day(b.checkOut)} · {money(Number(b.totalAmount))}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">{tr("réf. {0}", b.reference)}</p>
                    {b.notes && <p className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-sm text-ink">« {b.notes} »</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge color={SHORT_STAY_STATUS_COLORS[b.status as keyof typeof SHORT_STAY_STATUS_COLORS]}>
                      {tr(SHORT_STAY_STATUS_LABELS[b.status as keyof typeof SHORT_STAY_STATUS_LABELS])}
                    </Badge>
                    <ContactButtons phone={b.guestPhone} text={tr("Bonjour {0}, c'est l'agence IVOLOGIS au sujet de votre demande de réservation (réf. {1}).", b.guestName, b.reference)} />
                    {b.status === "EN_ATTENTE" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => decideBooking.mutate({ id: b.id, accept: true })}
                          disabled={decideBooking.isPending}
                          className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />{" "}{tr("Confirmer")}
                        </button>
                        <button
                          onClick={() => decideBooking.mutate({ id: b.id, accept: false })}
                          disabled={decideBooking.isPending}
                          className="flex items-center gap-1 rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/20 disabled:opacity-50"
                        >
                          <XIcon className="h-3.5 w-3.5" />{" "}{tr("Refuser")}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ))}
    </div>
  );
}
