"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Building2, User, UserRound, FileText, FileType, Calendar, Phone, Mail, MapPin, Wallet } from "lucide-react";
import { formatXOF, LEASE_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { DocumentLink } from "@/components/document-link";
import { LeaseStatusBadge, PaymentStatusBadge } from "@/components/status-badges";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { CountUp } from "@/components/dashboard/count-up";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

const DETAIL_LABELS: Record<string, string> = {
  occupantsCount: "Nombre d'occupants",
  noticePeriodMonths: "Préavis (mois)",
  furnitureInventory: "Inventaire du mobilier",
  guarantorName: "Nom du garant",
  guarantorPhone: "Téléphone du garant",
  guarantorAddress: "Adresse du garant",
  businessActivity: "Activité exercée",
  tradeName: "Enseigne",
  pasDePorte: "Pas-de-porte (FCFA)",
  renewalTacite: "Renouvellement tacite",
  profession: "Profession",
  professionalOrder: "Ordre professionnel",
  landUse: "Usage du terrain",
  titleReference: "Référence du titre foncier",
  constructionPermitRequired: "Autorisation de construire requise",
};

const DAY = 24 * 60 * 60 * 1000;

function formatDetail(key: string, value: unknown) {
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (key === "pasDePorte" && typeof value === "number") return formatXOF(value);
  return String(value);
}

function Party({ icon: Icon, title, name, lines }: { icon: typeof User; title: string; name: string; lines: (string | null | undefined)[] }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</p>
        <p className="font-semibold text-ink">{name}</p>
        {lines.filter(Boolean).map((l) => (
          <p key={l} className="flex items-center gap-1.5 text-xs text-ink-muted">
            {l!.includes("@") ? <Mail className="h-3 w-3" /> : l!.startsWith("+") || /^\d/.test(l!) ? <Phone className="h-3 w-3" /> : null}
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

export function LeaseDetail({ lease, backHref }: { lease: any; backHref: string }) {
  const now = Date.now();
  const start = new Date(lease.startDate).getTime();
  const end = new Date(lease.endDate).getTime();
  const elapsed = Math.min(1, Math.max(0, (now - start) / Math.max(1, end - start)));
  const daysLeft = Math.max(0, Math.ceil((end - now) / DAY));
  const months = Math.max(1, Math.round((end - start) / (30.4 * DAY)));
  const details = (lease.details ?? {}) as Record<string, unknown>;
  const detailEntries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== false);
  const payments: any[] = [...(lease.payments ?? [])].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  );
  const paid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour aux contrats
      </Link>

      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-6 text-white shadow-xl shadow-primary/20">
            <motion.div
              aria-hidden="true"
              animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-xs text-white/70">{lease.contractNumber}</p>
                <h1 className="mt-1 text-2xl font-bold">{LEASE_TYPE_LABELS[lease.type as keyof typeof LEASE_TYPE_LABELS]}</h1>
                <p className="text-sm text-white/80">{lease.property?.name} · {lease.property?.commune}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <LeaseStatusBadge status={lease.status} />
                </div>
              </div>
              <div className="flex items-center gap-5">
                <ProgressRing value={elapsed} size={84} stroke={8} color="#ffffff">
                  <div className="text-center">
                    <p className="text-lg font-bold"><CountUp value={daysLeft} /></p>
                    <p className="text-[10px] uppercase text-white/70">jours</p>
                  </div>
                </ProgressRing>
                <div className="text-sm text-white/80">
                  <p>Durée : {months} mois</p>
                  <p>{new Date(lease.startDate).toLocaleDateString("fr-FR")} → {new Date(lease.endDate).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Loyer mensuel", value: Number(lease.rentAmount), format: (n: number) => formatXOF(n) },
              { label: "Dépôt de garantie", value: Number(lease.deposit), format: (n: number) => formatXOF(n) },
              { label: "Avance", value: Number(lease.advance), format: (n: number) => formatXOF(n) },
              { label: "Total encaissé", value: paid, format: (n: number) => formatXOF(n) },
            ].map((k) => (
              <Card key={k.label}>
                <p className="text-sm text-ink-muted">{k.label}</p>
                <p className="mt-1 text-lg font-bold text-ink"><CountUp value={k.value} format={k.format} /></p>
              </Card>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Parties" />
              <div className="space-y-3">
                <Party icon={UserRound} title="Bailleur" name={lease.owner?.fullName ?? "—"} lines={[lease.owner?.phone, lease.owner?.email]} />
                <Party icon={User} title="Locataire" name={lease.tenant?.fullName ?? "—"} lines={[lease.tenant?.phone, lease.tenant?.email]} />
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Bien loué" subtitle={lease.property?.name} />
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <div>
                    <p className="text-ink-muted">Adresse</p>
                    <p className="font-medium text-ink">{lease.property?.address}, {lease.property?.commune}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <div>
                    <p className="text-ink-muted">Nature du bien</p>
                    <p className="font-medium text-ink">{PROPERTY_TYPE_LABELS[lease.property?.type as keyof typeof PROPERTY_TYPE_LABELS] ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <div>
                    <p className="text-ink-muted">Début du bail</p>
                    <p className="font-medium text-ink">{new Date(lease.startDate).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <div>
                    <p className="text-ink-muted">Fin du bail</p>
                    <p className="font-medium text-ink">{new Date(lease.endDate).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardHeader title="Conditions particulières" subtitle="Clauses propres à ce type de bail" />
            {detailEntries.length ? (
              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {detailEntries.map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <dt className="text-ink-muted">{DETAIL_LABELS[key] ?? key}</dt>
                    <dd className="font-medium text-ink">{formatDetail(key, value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-ink-muted">Aucune condition particulière renseignée.</p>
            )}
            {lease.specialConditions && (
              <div className="mt-4 rounded-xl bg-surface p-4 text-sm leading-relaxed text-ink">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Clauses libres</p>
                {lease.specialConditions}
              </div>
            )}
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardHeader title="Documents" subtitle="Téléchargements sécurisés, valables 10 minutes" />
            <div className="flex flex-wrap gap-3">
              {lease.documentUrl && (
                <DocumentLink path={lease.documentUrl} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary/40 hover:text-primary">
                  <FileText className="h-4 w-4" /> Contrat PDF
                </DocumentLink>
              )}
              {lease.wordUrl && (
                <DocumentLink path={lease.wordUrl} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary/40 hover:text-primary">
                  <FileType className="h-4 w-4" /> Contrat Word
                </DocumentLink>
              )}
              {!lease.documentUrl && !lease.wordUrl && (
                <p className="text-sm text-ink-muted">Aucun document généré pour ce contrat.</p>
              )}
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardHeader title="Historique des paiements" subtitle={`${payments.length} opération(s)`} />
            {payments.length ? (
              <ul className="divide-y divide-gray-100">
                {payments.map((p: any, i: number) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="h-4 w-4 text-ink-muted" />
                      <div>
                        <p className="font-semibold text-ink">{formatXOF(Number(p.amount))}</p>
                        <p className="text-xs text-ink-muted">
                          {new Date(p.paymentDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })} · période {new Date(p.periodMonth).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PaymentMethodBadge method={p.method} size="sm" />
                      <PaymentStatusBadge status={p.status} />
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">Aucun paiement enregistré sur ce bail.</p>
            )}
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}

