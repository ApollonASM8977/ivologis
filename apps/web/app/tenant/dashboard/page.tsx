"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Home, Wallet, FileText, Wrench, ArrowRight, CalendarClock, Receipt, CheckCircle2, Clock } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { formatXOF } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { PaymentStatusBadge, MaintenanceStatusBadge } from "@/components/status-badges";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { CountUp } from "@/components/dashboard/count-up";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

const DAY = 24 * 60 * 60 * 1000;

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export default function TenantDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });

  const { data: payments } = useQuery({
    queryKey: ["payments", "mine", "dashboard"],
    queryFn: async () => (await api.get("/payments", { params: { limit: 50 } })).data,
  });

  const { data: maintenance } = useQuery({
    queryKey: ["maintenance", "mine", "dashboard"],
    queryFn: async () => (await api.get("/maintenance", { params: { limit: 20 } })).data,
  });

  if (loadingProperties) return <LoadingState />;

  const property = properties?.[0];
  const lease = property?.leases?.[0];
  const firstName = user?.fullName?.split(" ")[0] ?? "";
  const now = new Date();

  const paymentList: any[] = payments?.data ?? [];
  const paidThisMonth = paymentList.some(
    (p) => p.status === "PAID" && sameMonth(new Date(p.periodMonth), now),
  );
  const totalPaid = paymentList
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const openRequests: any[] = (maintenance?.data ?? []).filter((m: any) => m.status === "RECU" || m.status === "EN_COURS");

  let contract: { daysLeft: number; elapsed: number } | null = null;
  if (lease) {
    const start = new Date(lease.startDate).getTime();
    const end = new Date(lease.endDate).getTime();
    contract = {
      daysLeft: Math.max(0, Math.ceil((end - now.getTime()) / DAY)),
      elapsed: Math.min(1, Math.max(0, (now.getTime() - start) / Math.max(1, end - start))),
    };
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-ink-muted">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Bonjour{firstName ? `, ${firstName}` : ""}</h1>
      </motion.div>

      {!property ? (
        <EmptyState icon={Home} title="Aucun logement associé" description="Contactez votre agence si vous pensez qu'il s'agit d'une erreur." />
      ) : (
        <StaggerContainer className="space-y-4">
          <StaggerItem>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-6 text-white shadow-xl shadow-primary/25">
              <motion.div
                aria-hidden="true"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Mon logement</p>
                  <h2 className="mt-1 text-2xl font-bold">{property.name}</h2>
                  <p className="text-sm text-white/80">{property.address}, {property.commune}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="text-3xl font-extrabold">
                      <CountUp value={Number(property.rentAmount)} format={(n) => formatXOF(n)} />
                    </span>
                    <span className="text-sm text-white/80">/ mois</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  {paidThisMonth ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-green-300" /> Loyer du mois réglé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-300/20 px-3 py-1.5 text-sm font-semibold text-amber-100">
                      <Clock className="h-4 w-4" /> Loyer du mois à régler
                    </span>
                  )}
                  <Link href="/tenant/payments" className="relative">
                    {!paidThisMonth && (
                      <motion.span
                        aria-hidden="true"
                        animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 rounded-xl bg-white"
                      />
                    )}
                    <span className="relative inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5">
                      {paidThisMonth ? "Voir mes paiements" : "Payer maintenant"} <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-ink-muted">Total réglé</p>
                <p className="mt-1 text-2xl font-bold text-ink">
                  <CountUp value={totalPaid} format={(n) => formatXOF(n)} />
                </p>
                <p className="mt-1 text-xs text-ink-muted">{paymentList.filter((p) => p.status === "PAID").length} paiement(s)</p>
              </Card>
              <Card>
                <p className="text-sm text-ink-muted">Demandes en cours</p>
                <p className="mt-1 text-2xl font-bold text-ink">
                  <CountUp value={openRequests.length} />
                </p>
                <p className="mt-1 text-xs text-ink-muted">Maintenance signalée</p>
              </Card>
              <Card className="flex items-center gap-4">
                {contract ? (
                  <>
                    <ProgressRing value={contract.elapsed} size={64} stroke={7}>
                      <CalendarClock className="h-5 w-5 text-primary" />
                    </ProgressRing>
                    <div>
                      <p className="text-sm text-ink-muted">Fin du bail</p>
                      <p className="text-2xl font-bold text-ink">
                        <CountUp value={contract.daysLeft} /> <span className="text-sm font-medium text-ink-muted">jours</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">Aucun bail actif.</p>
                )}
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader title="Derniers paiements" subtitle="Vos dernières transactions" />
                {paymentList.length ? (
                  <ol className="relative space-y-4 border-l border-gray-200 pl-6">
                    {paymentList.slice(0, 5).map((p: any, i: number) => (
                      <motion.li
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="relative"
                      >
                        <span
                          className={`absolute -left-[31px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white ${p.status === "PAID" ? "bg-success" : "bg-amber-400"}`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-ink">{formatXOF(Number(p.amount))}</p>
                            <p className="text-xs text-ink-muted">
                              {new Date(p.paymentDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PaymentMethodBadge method={p.method} size="sm" />
                            <PaymentStatusBadge status={p.status} />
                            {p.receipt?.pdfUrl && (
                              <a href={fileUrl(p.receipt.pdfUrl)} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-ink-muted hover:bg-gray-100 hover:text-primary" aria-label="Télécharger la quittance">
                                <Receipt className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-ink-muted">Aucun paiement enregistré.</p>
                )}
              </Card>

              <Card>
                <CardHeader title="Raccourcis" />
                <div className="space-y-2">
                  {[
                    { href: "/tenant/lease", icon: FileText, label: "Mon contrat" },
                    { href: "/tenant/payments", icon: Wallet, label: "Historique paiements" },
                    { href: "/tenant/maintenance", icon: Wrench, label: "Mes demandes" },
                  ].map((s, i) => (
                    <motion.div key={s.href} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}>
                      <Link href={s.href} className="group flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-ink transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                        <span className="flex items-center gap-2"><s.icon className="h-4 w-4" /> {s.label}</span>
                        <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card>
              <CardHeader title="Mes demandes de maintenance" subtitle={`${openRequests.length} en cours`} />
              {maintenance?.data?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {maintenance.data.slice(0, 4).map((m: any, i: number) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                      <Link href={`/tenant/maintenance`} className="block rounded-xl border border-gray-100 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 text-sm font-medium text-ink">{m.description}</p>
                          <MaintenanceStatusBadge status={m.status} />
                        </div>
                        <p className="mt-1 text-xs text-ink-muted">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Aucune demande. Un souci dans le logement ? Signalez-le en deux clics.</p>
              )}
            </Card>
          </StaggerItem>
        </StaggerContainer>
      )}
    </div>
  );
}
