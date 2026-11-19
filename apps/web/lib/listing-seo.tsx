import type { Metadata } from "next";
import { PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { formatMoney, translator, type Lang } from "@/lib/i18n";
import { LABELS_EN } from "@/messages/en/labels";
import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/page-meta";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ListingKind = "sales" | "rentals" | "short-stay";
const ROUTE: Record<ListingKind, string> = { sales: "sales", rentals: "locations", "short-stay": "short-stay" };
const DEAL: Record<Lang, Record<ListingKind, string>> = {
  fr: { sales: "à vendre", rentals: "à louer", "short-stay": "en location meublée" },
  en: { sales: "for sale", rentals: "for rent", "short-stay": "furnished, short stay" },
};

/**
 * Lecture serveur d'une annonce publique (sans compter de visite). `false` si l'API répond 404 (annonce inconnue ou retirée :
 * la page renvoie une vraie 404) ; `null` si l'API dort ou ne répond pas (la page se charge alors côté navigateur).
 */
export async function fetchListing(kind: ListingKind, id: string): Promise<any | null | false> {
  try {
    const res = await fetch(`${API}/api/catalog/${kind}/${encodeURIComponent(id)}`, {
      headers: { "x-ivologis-no-count": "1" },
      next: { revalidate: 600 },
      // Plan gratuit Render : si l'API se réveille, on n'attend pas, la page reste fonctionnelle côté client.
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return false;
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export type CatalogPage = { data: any[]; total: number; page: number; limit: number };

/** Première page du catalogue rendue côté serveur : les annonces sont dans le HTML (pas d'attente du JavaScript en 3G). */
export async function fetchCatalogPage(kind: ListingKind, qs: string): Promise<CatalogPage | null> {
  try {
    const res = await fetch(`${API}/api/catalog/${kind}${qs ? `?${qs}` : ""}`, { next: { revalidate: 120 }, signal: AbortSignal.timeout(8000) });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/** Paramètres d'URL de la page → chaîne de requête, dans l'ordre reçu (même clé de cache que côté client). */
export function toQueryString(params: Record<string, string | string[] | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, Array.isArray(v) ? v[0] : v);
  }
  return qs.toString();
}

/** Annonces publiées (hors démo) pour le sitemap. */
export async function fetchPublishedListings(kind: ListingKind): Promise<{ id: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API}/api/catalog/${kind}?limit=100`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const body = await res.json();
    return (body.data ?? []).filter((p: any) => !p.isDemo).map((p: any) => ({ id: p.id, updatedAt: p.updatedAt }));
  } catch {
    return [];
  }
}

function price(kind: ListingKind, p: any) {
  if (kind === "sales") return Number(p.salePrice ?? 0);
  if (kind === "rentals") return Number(p.rentAmount ?? 0);
  return Number(p.shortStayNightlyRate ?? 0);
}

function priceText(kind: ListingKind, p: any, lang: Lang) {
  const suffix = kind === "rentals" ? (lang === "en" ? " / month" : " / mois") : kind === "short-stay" ? (lang === "en" ? " / night" : " / nuit") : "";
  return `${formatMoney(price(kind, p), lang)}${suffix}`;
}

function absoluteImage(url?: string) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${API}${url}`;
}

function place(p: any) {
  return [p.neighborhood, p.commune, p.city && p.city !== p.commune ? p.city : null].filter(Boolean).join(", ");
}

export function listingPath(kind: ListingKind, id: string) {
  return `/catalogue/${ROUTE[kind]}/${id}`;
}

export function listingMetadata(kind: ListingKind, p: any, lang: Lang): Metadata {
  const tr = translator(lang, LABELS_EN);
  const type = tr(PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS] ?? "Bien");
  // Contenu de l'annonce dans la langue de la page (version anglaise si elle existe).
  const name = lang === "en" && p.nameEn ? p.nameEn : p.name;
  const text = lang === "en" && p.descriptionEn ? p.descriptionEn : p.description;
  const title = `${name} — ${priceText(kind, p, lang)}`;
  const rooms = p.rooms ? (lang === "en" ? `, ${p.rooms} rooms` : `, ${p.rooms} pièces`) : "";
  const where = lang === "en" ? "in" : "à";
  const summary = `${type} ${DEAL[lang][kind]} ${where} ${place(p)}${rooms}${p.surfaceM2 ? `, ${Number(p.surfaceM2)} m²` : ""}${lang === "en" ? ":" : " :"} ${priceText(kind, p, lang)}.`;
  const description = (text ? `${summary} ${text}` : summary).slice(0, 160);
  const cover = p.images?.find((i: any) => i.isCover) ?? p.images?.[0];
  return {
    // Adresse, langue, nom du site, aperçu X ; sans photo, l'image générale du site.
    ...pageMetadata(lang, listingPath(kind, p.id), title, description, absoluteImage(cover?.url)),
    // Une annonce de démonstration ne doit jamais apparaître dans Google.
    robots: p.isDemo ? { index: false, follow: false } : undefined,
  };
}

/** Données structurées schema.org (RealEstateListing), échappées contre l'injection de balises. */
export function ListingJsonLd({ kind, p }: { kind: ListingKind; p: any }) {
  if (p.isDemo) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.name,
    description: p.description ?? undefined,
    url: `${siteUrl}${listingPath(kind, p.id)}`,
    dateModified: p.updatedAt,
    image: (p.images ?? []).map((i: any) => absoluteImage(i.url)),
    offers: { "@type": "Offer", price: price(kind, p), priceCurrency: "XOF", availability: "https://schema.org/InStock" },
    contentLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: p.commune, addressRegion: p.city, addressCountry: "CI" },
      ...(p.latitude && p.longitude ? { geo: { "@type": "GeoCoordinates", latitude: Number(p.latitude), longitude: Number(p.longitude) } } : {}),
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
