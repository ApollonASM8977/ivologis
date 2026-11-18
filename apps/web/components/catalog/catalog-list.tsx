"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePath } from "@/lib/i18n-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MapPin, SlidersHorizontal, ShieldCheck, type LucideIcon } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/dashboard/count-up";
import { api, fileUrl } from "@/lib/api";
import { AUTRES_VILLES, COMMUNES_ABIDJAN, PROPERTY_TYPE_LABELS, PropertyType } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { DemoBadge, locationLabel } from "@/components/catalog/property-extras";

export type CatalogKind = "sales" | "rentals" | "short-stay";

interface CatalogListProps {
  kind: CatalogKind;
  basePath: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  emptyTitle: string;
  priceLabel: string;
  price: (p: any) => string;
  showFurnished?: boolean;
  /** Page déjà chargée par le serveur pour la requête `initialQs` (catalogue public). */
  initialData?: { data: any[]; total: number; page: number; limit: number } | null;
  initialQs?: string;
}

const LOADING_HINT = "Premier chargement : jusqu'à une minute si le site était inactif.";

export function CatalogList(props: CatalogListProps) {
  // Catalogue public : page dynamique, les paramètres sont connus au rendu serveur, pas besoin de frontière.
  // Avec elle, React envoie ce gros contenu en fin de page et diffère son affichage (~300 ms) : LCP plus tardif.
  if (props.initialQs !== undefined) return <CatalogListInner {...props} />;
  // Espaces (pages statiques) : useSearchParams impose une frontière Suspense.
  return (
    <Suspense fallback={<ListingSkeletons />}>
      <CatalogListInner {...props} />
    </Suspense>
  );
}

/** Squelettes de cartes animés : la grille garde sa forme pendant le chargement (et le réveil du serveur). */
function ListingSkeletons() {
  return (
    <div role="status" aria-live="polite">
      <p className="mb-3 flex items-center gap-2 text-sm text-ink-muted">
        <span className="ivo-ping h-2 w-2 rounded-full bg-primary" />
        Chargement des annonces… {LOADING_HINT}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="ivo-fade-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="space-y-2.5 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogListInner({ kind, basePath, title, subtitle, icon: Icon, emptyTitle, priceLabel, price, showFurnished, initialData, initialQs }: CatalogListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePath();
  const qs = searchParams.toString();
  const current = Object.fromEntries(searchParams.entries());

  const { data, isLoading, isFetching } = useQuery<{ data: any[]; total: number; page: number; limit: number }>({
    queryKey: ["catalog", kind, qs],
    queryFn: async () => (await api.get(`/catalog/${kind}${qs ? `?${qs}` : ""}`)).data,
    placeholderData: keepPreviousData,
    initialData: initialData && qs === initialQs ? initialData : undefined,
    staleTime: 60_000,
  });

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    apply(Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v).trim()])));
  }

  const page = data?.page ?? 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const filtered = Object.keys(current).some((k) => k !== "page" && k !== "sort");

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      <form
        key={qs}
        onSubmit={onSubmit}
        className="ivo-fade-in relative mb-6 grid grid-cols-2 gap-3 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6"
      >
        {/* Barre de progression pendant la recherche (CSS). */}
        {isFetching && !isLoading && (
          <span aria-hidden="true" className="ivo-progress absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        )}
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="f-zone">Commune / ville</Label>
          <Select id="f-zone" name="zone" defaultValue={current.zone ?? ""}>
            <option value="">Toutes</option>
            <optgroup label="Abidjan">
              {COMMUNES_ABIDJAN.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="Autres villes">
              {AUTRES_VILLES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </optgroup>
          </Select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="f-quartier">Quartier</Label>
          <Input id="f-quartier" name="neighborhood" placeholder="Ex : Riviera, Angré" defaultValue={current.neighborhood ?? ""} />
        </div>
        <div>
          <Label htmlFor="f-type">Type</Label>
          <Select id="f-type" name="type" defaultValue={current.type ?? ""}>
            <option value="">Tous</option>
            {Object.values(PropertyType).map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-max">{priceLabel} max (FCFA)</Label>
          <Input id="f-max" name="maxPrice" type="number" min={0} step={5000} inputMode="numeric" defaultValue={current.maxPrice ?? ""} />
        </div>
        <div>
          <Label htmlFor="f-rooms">Pièces</Label>
          <Select id="f-rooms" name="minRooms" defaultValue={current.minRooms ?? ""}>
            <option value="">Indifférent</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 ou plus" : `${n} ou plus`}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-sort">Trier par</Label>
          <Select id="f-sort" name="sort" defaultValue={current.sort ?? ""}>
            <option value="">Plus récentes</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </Select>
        </div>
        <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-3 lg:col-span-6">
          {showFurnished && (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" name="furnished" value="true" defaultChecked={current.furnished === "true"} className="h-4 w-4 rounded border-gray-300" />
              Meublé uniquement
            </label>
          )}
          <div className="ml-auto flex gap-2">
            {filtered && (
              <Button type="button" variant="ghost" onClick={() => apply({})}>
                Effacer
              </Button>
            )}
            <Button type="submit" loading={isFetching && !isLoading}>
              <SlidersHorizontal className="h-4 w-4" /> Filtrer
            </Button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <ListingSkeletons />
      ) : !data?.data.length ? (
        <EmptyState
          icon={Icon}
          title={filtered ? "Aucune annonce ne correspond à ces critères" : emptyTitle}
          description={filtered ? "Élargissez la zone ou le budget." : "Revenez bientôt, de nouvelles annonces seront publiées ici."}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-muted" aria-live="polite">
            <span className="font-semibold text-ink">
              <CountUp value={data.total} duration={0.6} />
            </span>{" "}
            annonce{data.total > 1 ? "s" : ""}
            {isFetching && " · mise à jour…"}
          </p>
          <StaggerContainer key={qs} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((p) => (
              <StaggerItem key={p.id} className="h-full">
                <ListingCard p={p} href={`${basePath}/${p.id}`} price={price(p)} icon={Icon} />
              </StaggerItem>
            ))}
          </StaggerContainer>
          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pagination">
              <Button variant="secondary" disabled={page <= 1} onClick={() => apply({ ...current, page: String(page - 1) })}>
                Précédent
              </Button>
              <span className="text-sm text-ink-muted">
                Page {page} sur {pages}
              </span>
              <Button variant="secondary" disabled={page >= pages} onClick={() => apply({ ...current, page: String(page + 1) })}>
                Suivant
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function ListingCard({ p, href, price, icon: Icon }: { p: any; href: string; price: string; icon: LucideIcon }) {
  const cover = p.images?.find((img: any) => img.isCover) ?? p.images?.[0];
  return (
    <div className="ivo-lift h-full rounded-xl">
    <Link href={href} className="group block h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1.5">
          {p.isDemo && <DemoBadge />}
          {p.landTitleVerified && !p.isDemo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-green-800">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Titre vérifié
            </span>
          )}
          {p.furnished && <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-ink">Meublé</span>}
        </div>
        {cover ? (
          <Image
            src={fileUrl(cover.url) ?? ""}
            alt={p.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-ink group-hover:text-primary">{p.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {locationLabel(p)}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
          {PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS]}
          {p.rooms ? ` · ${p.rooms} pièces` : ""}
          {p.surfaceM2 ? ` · ${Number(p.surfaceM2)} m²` : ""}
        </p>
        <p className="mt-1 text-lg font-bold text-primary">{price}</p>
      </div>
    </Link>
    </div>
  );
}
