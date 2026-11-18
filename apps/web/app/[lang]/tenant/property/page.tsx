"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Home, Layers, CalendarDays, Sofa, Navigation, X, ChevronLeft, ChevronRight, Check, User, Phone } from "lucide-react";
import { usePublicCompany } from "@/lib/use-company";
import { api, fileUrl } from "@/lib/api";
import { PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { t } from "@/lib/t-spaces";
import { money, pick } from "@/lib/t";

function Fact({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function TenantPropertyPage() {
  const [active, setActive] = useState<number | null>(null);
  const { data: company } = usePublicCompany();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });

  if (isLoading) return <LoadingState />;
  const property = properties?.[0];

  if (!property) {
    return (
      <div>
        <PageHeader title={t("Mon logement")} />
        <EmptyState icon={Home} title={t("Aucun logement associé à votre compte")} />
      </div>
    );
  }

  const images: any[] = property.images ?? [];
  const amenities: string[] = property.amenities ?? [];
  const cover = images.find((i) => i.isCover) ?? images[0];

  function step(delta: number) {
    if (active === null || !images.length) return;
    setActive((active + delta + images.length) % images.length);
  }

  return (
    <div>
      <PageHeader title={t("Mon logement")} subtitle={pick(property.name, property.nameEn)} />

      <StaggerContainer className="space-y-4">
        {images.length > 0 && (
          <StaggerItem>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {cover && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setActive(images.indexOf(cover))}
                  className="relative col-span-2 row-span-2 min-h-[14rem] overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={t("Agrandir la photo de couverture")}
                >
                  <Image src={fileUrl(cover.url) ?? ""} alt={pick(property.name, property.nameEn)} fill sizes="(min-width: 768px) 50vw, 66vw" priority className="object-cover transition-transform duration-700 hover:scale-105" />
                </motion.button>
              )}
              {images
                .filter((i) => i !== cover)
                .slice(0, 4)
                .map((img, i) => (
                  <motion.button
                    key={img.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setActive(images.indexOf(img))}
                    className="relative min-h-[6.5rem] overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label={t("Agrandir la photo {0}", i + 2)}
                  >
                    <Image src={fileUrl(img.url) ?? ""} alt="" fill sizes="25vw" className="object-cover" />
                  </motion.button>
                ))}
            </div>
          </StaggerItem>
        )}

        <StaggerItem>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-ink">{pick(property.name, property.nameEn)}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPin className="h-4 w-4" /> {property.address}, {property.commune}
                </p>
                {property.landmark && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    <Navigation className="h-4 w-4" />{" "}{t("Repère : {0}", property.landmark)}
                  </p>
                )}
              </div>
              <Badge color="blue">{t(PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS])}</Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Fact icon={Home} label={t("Loyer mensuel")} value={money(property.leases?.[0]?.rentAmount ?? property.rentAmount)} />
              <Fact icon={Layers} label={t("Étage")} value={property.floor ?? "-"} />
              <Fact icon={CalendarDays} label={t("Année de construction")} value={property.yearBuilt ?? "-"} />
              <Fact icon={Sofa} label={t("Meublé")} value={property.furnished ? t("Oui") : t("Non")} />
            </div>

            {property.description && <p className="mt-5 text-sm leading-relaxed text-ink-muted">{pick(property.description, property.descriptionEn)}</p>}
          </Card>
        </StaggerItem>

        {amenities.length > 0 && (
          <StaggerItem>
            <Card>
              <CardHeader title={t("Équipements")} subtitle={t("{0} équipement(s) dans le logement", amenities.length)} />
              <ul className="flex flex-wrap gap-2">
                {amenities.map((a, i) => (
                  <motion.li
                    key={a}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success"
                  >
                    <Check className="h-3.5 w-3.5" /> {t(a)}
                  </motion.li>
                ))}
              </ul>
            </Card>
          </StaggerItem>
        )}

        {/* Tout passe par l'agence : le locataire la contacte, jamais le propriétaire directement. */}
        <StaggerItem>
          <Card className="flex flex-wrap items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">{t("Votre interlocuteur")}</p>
              <p className="font-semibold text-ink">{company?.companyName ?? t("Votre agence")}</p>
              <p className="text-sm text-ink-muted">{t("Loyer, travaux, préavis : l'agence gère tout pour le compte du propriétaire.")}</p>
            </div>
            {company?.phone && (
              <a href={`tel:${company.phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                <Phone className="h-4 w-4" />{" "}{t("Appeler l'agence")}
              </a>
            )}
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <AnimatePresence>
        {active !== null && images[active] && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={t("Galerie photos")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setActive(null);
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
            tabIndex={-1}
            ref={(el) => el?.focus()}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          >
            <motion.img
              key={images[active].id}
              src={fileUrl(images[active].url)}
              alt={pick(property.name, property.nameEn)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button type="button" onClick={() => setActive(null)} aria-label={t("Fermer")} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={t("Photo précédente")} className="absolute left-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={t("Photo suivante")} className="absolute right-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 sm:right-16">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
