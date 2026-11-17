"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlaskConical, MessageCircle, Phone, ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { CardHeader } from "@/components/ui/card";
import { usePublicCompany } from "@/lib/use-company";
import { fileUrl } from "@/lib/api";

/** Apparition douce d'une section quand elle entre à l'écran (CSS piloté par le défilement, sans JavaScript). */
export function Reveal({ children, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <div className={`ivo-reveal ${className}`}>{children}</div>;
}

/** Galerie : vignettes avec zoom au survol, plein écran avec flèches, clavier et glissement au doigt (sans bibliothèque). */
export function PhotoGallery({ images, alt }: { images?: { id: string; url: string }[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const swipeStart = useRef<number | null>(null);
  const count = images?.length ?? 0;
  const go = useCallback((delta: number) => setOpen((i) => (i === null ? i : (i + delta + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (!count) return null;
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images!.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            // Mouvement seul : la photo principale compte comme affichée dès le premier rendu (LCP).
            style={{ animationDelay: `${i * 60}ms` }}
            className={`ivo-rise ivo-lift group relative overflow-hidden rounded-lg bg-gray-100 ${i === 0 && count > 2 ? "col-span-2 row-span-2 h-56 sm:h-full" : "h-28"}`}
            aria-label={`Agrandir la photo ${i + 1} sur ${count}`}
          >
            <Image
              src={fileUrl(img.url) ?? ""}
              alt={`${alt} — photo ${i + 1}`}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "200px"}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
              <Expand className="h-6 w-6 text-white" />
            </span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photos du bien"
          className="ivo-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          <button type="button" aria-label="Fermer" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setOpen(null)}>
            <X className="h-6 w-6" />
          </button>
          {count > 1 && (
            <>
              <button type="button" aria-label="Photo précédente" className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(-1); }}>
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button type="button" aria-label="Photo suivante" className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(1); }}>
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
          <div
            key={open}
            className="ivo-zoom-in relative h-[75vh] w-full max-w-5xl touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            // Glisser au doigt (ou à la souris) vers la gauche ou la droite pour changer de photo.
            onPointerDown={(e) => (swipeStart.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipeStart.current === null) return;
              const dx = e.clientX - swipeStart.current;
              swipeStart.current = null;
              if (dx < -60) go(1);
              if (dx > 60) go(-1);
            }}
          >
            <Image src={fileUrl(images![open].url) ?? ""} alt={`${alt} — photo ${open + 1}`} fill sizes="100vw" className="select-none object-contain" draggable={false} />
          </div>
          <p className="absolute bottom-4 text-sm text-white/80">
            {open + 1} / {count}
          </p>
        </div>
      )}
    </>
  );
}

/** Numéro international pour wa.me : les numéros ivoiriens à 10 chiffres reçoivent l'indicatif 225. */
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `225${digits}` : digits;
}

/** Contact en deux gestes vers l'agence (jamais vers le propriétaire). */
export function AgencyContact({ listingName, disabled }: { listingName: string; disabled?: boolean }) {
  const { data: company } = usePublicCompany();
  const whatsapp = company?.whatsappPhone;
  const phone = company?.phone;
  // L'adresse de la page n'existe que dans le navigateur : la lire au rendu serveur la laissait vide dans le message.
  // Hooks avant tout retour conditionnel (règle des hooks : sinon erreur React #310 quand les données arrivent).
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => setPageUrl(window.location.href), []);
  if (disabled || (!whatsapp && !phone)) return null;
  const message = `Bonjour, je suis intéressé(e) par l'annonce « ${listingName} »${pageUrl ? ` : ${pageUrl}` : ""}`;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {whatsapp && (
        <a
          href={`https://wa.me/${waNumber(whatsapp)}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
        >
          <MessageCircle className="h-4 w-4" /> Écrire à l&apos;agence sur WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-primary/40 hover:text-primary"
        >
          <Phone className="h-4 w-4" /> Appeler l&apos;agence
        </a>
      )}
    </div>
  );
}

interface Located {
  address?: string | null;
  neighborhood?: string | null;
  commune?: string | null;
  city?: string | null;
}

/** « Quartier, Commune » (+ ville hors Abidjan), avec l'adresse en tête si demandée. */
export function locationLabel(p: Located, withAddress = false) {
  const city = p.city && p.city !== "Abidjan" && p.city !== p.commune ? p.city : null;
  const address = withAddress ? p.address : null;
  // Les adresses saisies contiennent souvent déjà le quartier ou la commune : on évite « Yopougon, Yopougon ».
  const rest = [p.neighborhood, p.commune, city].filter((part) => part && !address?.toLowerCase().includes(part.toLowerCase()));
  return [address, ...rest].filter(Boolean).join(", ");
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
      <FlaskConical className="h-3 w-3" aria-hidden="true" /> Démo
    </span>
  );
}

export function DemoNotice() {
  return (
    <div role="note" className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
      <p>
        <strong>Annonce de démonstration.</strong> Ce bien est fictif : il sert à montrer le fonctionnement du catalogue. Les photos, le prix et
        les documents ne correspondent à aucun bien réel, et aucune demande ne peut être envoyée.
      </p>
    </div>
  );
}

export function LocationMap({ latitude, longitude }: { latitude?: number | string | null; longitude?: number | string | null }) {
  const lat = latitude != null ? Number(latitude) : null;
  const lng = longitude != null ? Number(longitude) : null;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const delta = 0.01;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5 pb-0">
        <CardHeader title="Emplacement" />
      </div>
      <iframe src={src} loading="lazy" className="h-64 w-full border-0" title="Emplacement du bien" />
    </div>
  );
}

export function VirtualTourCard({ url }: { url?: string | null }) {
  if (!url) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5 pb-0">
        <CardHeader title="Visite virtuelle 360°" />
      </div>
      <iframe src={url} loading="lazy" allow="xr-spatial-tracking; gyroscope; accelerometer" className="h-96 w-full border-0" title="Visite virtuelle 360°" />
    </div>
  );
}
