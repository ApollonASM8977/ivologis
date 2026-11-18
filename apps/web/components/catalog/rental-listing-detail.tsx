"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Ruler, Tag, CalendarCheck, CheckCircle2, Scale, ShieldAlert, DoorOpen } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { PROPERTY_TYPE_LABELS, rentalEntryCost } from "@ivologis/shared";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";
import { CountUp } from "@/components/dashboard/count-up";
import { HoneypotField } from "@/components/ui/honeypot";
import { LocationMap, VirtualTourCard, DemoNotice, AgencyContact, locationLabel, PhotoGallery } from "@/components/catalog/property-extras";
import { t } from "@/lib/t-catalog";
import { locale, money } from "@/lib/t";

interface VisitForm {
  preferredDate?: string;
  message?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  website?: string;
}

function months(amount: number, rent: number) {
  if (!rent || !amount) return "";
  const m = Math.round((amount / rent) * 10) / 10;
  return t(" ({0} mois)", m.toLocaleString(locale()));
}

export function RentalListingDetail({ id, basePath, initial }: { id: string; basePath: string; initial?: any }) {
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VisitForm>();

  const { data: property, isLoading } = useQuery({
    queryKey: ["catalog", "rentals", id],
    queryFn: async () => (await api.get(`/catalog/rentals/${id}`)).data,
    initialData: initial ?? undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: VisitForm) => api.post(`/properties/${id}/visit-requests`, values),
    onSuccess: (res) => {
      setReference(res.data.reference);
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !property) return <LoadingState hint={t("Premier chargement : jusqu'à une minute si le site était inactif.")} />;

  const rent = Number(property.rentAmount);
  const cost = rentalEntryCost(rent, Number(property.deposit), Number(property.advance));
  const aboveCap = cost.deposit > rent * 2 || cost.advance > rent * 2;

  return (
    <div className="stagger-children">
      <Link href={basePath} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />{" "}{t("Retour au catalogue")}
      </Link>

      {property.isDemo && <DemoNotice />}

      <PhotoGallery images={property.images} alt={property.name} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{property.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" /> {locationLabel(property, true)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            <CountUp value={rent} format={money} />{" "}{t("/ mois")}
          </p>
          {property.furnished && <p className="mt-1 text-xs font-medium text-ink-muted">{t("Meublé")}</p>}
        </div>
      </div>

      <AgencyContact listingName={property.name} disabled={property.isDemo} />

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase text-ink-muted">{t("Type")}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{t(PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS])}</p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs uppercase text-ink-muted">
            <DoorOpen className="h-3.5 w-3.5" />{" "}{t("Pièces")}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {property.rooms ? `${property.rooms}${property.bedrooms ? t(" dont {0} ch.", property.bedrooms) : ""}` : "-"}
          </p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs uppercase text-ink-muted">
            <Ruler className="h-3.5 w-3.5" />{" "}{t("Surface")}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.surfaceM2 ? `${property.surfaceM2} m²` : "-"}</p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs uppercase text-ink-muted">
            <Tag className="h-3.5 w-3.5" />{" "}{t("Repère")}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.landmark ?? "-"}</p>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title={t("Ce que vous payez à l'entrée")} />
        <dl className="divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-ink-muted">{t("Avance")}{months(cost.advance, rent)}</dt>
            <dd className="font-medium text-ink">{money(cost.advance)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-ink-muted">{t("Caution")}{months(cost.deposit, rent)}{t(", restituée en fin de bail")}</dt>
            <dd className="font-medium text-ink">{money(cost.deposit)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-ink-muted">{t("Frais d'agence, part locataire (½ mois)")}</dt>
            <dd className="font-medium text-ink">{money(cost.agencyFeeTenantShare)}</dd>
          </div>
          <div className="flex justify-between py-2 text-base">
            <dt className="font-semibold text-ink">{t("Total à prévoir")}</dt>
            <dd className="font-bold text-primary">
              <CountUp value={cost.total} format={money} />
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface p-3 text-xs text-ink-muted">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            {t("L'avance correspond aux premiers mois de loyer payés d'avance. Pour un logement, la loi n° 2019-576 plafonne la caution et l'avance à 2 mois de loyer chacune ; les frais d'agence (1 mois hors taxes) sont partagés à parts égales entre bailleur et locataire (décret n° 2024-1115).")}
            {aboveCap && t(" Les montants affichés dépassent ce plafond : l'agence vous confirmera les conditions avant toute signature.")}
          </p>
        </div>
      </Card>

      {property.description && (
        <Card className="mt-4">
          <CardHeader title={t("Description")} />
          <p className="text-sm leading-relaxed text-ink-muted">{property.description}</p>
        </Card>
      )}

      {!!property.amenities?.length && (
        <Card className="mt-4">
          <CardHeader title={t("Équipements")} />
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a: string) => (
              <span key={a} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {a}
              </span>
            ))}
          </div>
        </Card>
      )}

      <LocationMap latitude={property.latitude} longitude={property.longitude} />
      <VirtualTourCard url={property.virtualTourUrl} />

      <Button className="mt-6" onClick={() => setModalOpen(true)} disabled={property.isDemo}>
        <CalendarCheck className="h-4 w-4" />{" "}{t("Demander une visite")}
      </Button>
      {property.isDemo && <p className="mt-2 text-xs text-ink-muted">{t("Indisponible sur une annonce de démonstration.")}</p>}
      <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-muted">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        <span>
          {t("Ne versez rien avant la visite et la signature du bail à l'agence, contre reçu.")}{" "}
          <Link href="/verification" className="font-medium text-primary hover:underline">
            {t("Comment nous vérifions les annonces")}
          </Link>
        </span>
      </p>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setReference(null);
        }}
        title={t("Demande de visite")}
      >
        {reference ? (
          <div className="space-y-3 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <p className="text-sm text-ink">{t("Votre demande a bien été envoyée. L'agence vous recontacte pour fixer la visite.")}</p>
            <p className="rounded-lg bg-surface px-3 py-2 text-sm">
              {t("Référence à conserver :")}{" "}<span className="font-mono font-semibold text-ink">{reference}</span>
            </p>
            <Button className="w-full" onClick={() => { setModalOpen(false); setReference(null); }}>
              {t("Fermer")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <p className="text-sm text-ink-muted">{t("L'agence vous recontacte pour fixer la date de visite.")}</p>
            <HoneypotField registration={register("website")} />
            {!user && (
              <>
                <div>
                  <Label htmlFor="vf-guestName">{t("Nom complet")}</Label>
                  <Input id="vf-guestName" aria-invalid={!!errors.guestName} {...register("guestName", { required: t("Votre nom est requis."), minLength: { value: 2, message: t("Nom trop court.") } })} />
                  {errors.guestName && <p role="alert" className="mt-1 text-xs text-danger">{errors.guestName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="vf-guestPhone">{t("Téléphone")}</Label>
                  <Input id="vf-guestPhone" aria-invalid={!!errors.guestPhone} type="tel" {...register("guestPhone", { required: t("Votre téléphone est requis."), pattern: { value: /^[+0-9 ().-]{8,20}$/, message: t("Numéro de téléphone invalide.") } })} />
                  {errors.guestPhone && <p role="alert" className="mt-1 text-xs text-danger">{errors.guestPhone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="vf-guestEmail">{t("Email (optionnel)")}</Label>
                  <Input id="vf-guestEmail" type="email" {...register("guestEmail")} />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="vf-preferredDate">{t("Date souhaitée (optionnel)")}</Label>
              <Input id="vf-preferredDate" type="date" {...register("preferredDate")} />
            </div>
            <div>
              <Label htmlFor="vf-message">{t("Message (optionnel)")}</Label>
              <Textarea id="vf-message" rows={3} placeholder={t("Date d'entrée souhaitée, nombre de personnes, questions...")} {...register("message")} />
            </div>
            <Button type="submit" className="w-full" loading={mutation.isPending}>
              {t("Envoyer la demande")}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
