import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { fetchPublishedListings, listingPath, type ListingKind } from "@/lib/listing-seo";

export const revalidate = 3600;

const STATIC_PAGES = ["", "/catalogue", "/catalogue/locations", "/catalogue/sales", "/catalogue/short-stay", "/verification", "/securite", "/mentions-legales", "/confidentialite"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/catalogue") ? "daily" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/catalogue") ? 0.8 : 0.4,
  }));

  // Si l'API dort (plan gratuit), le sitemap reste valide avec les pages fixes.
  const kinds: ListingKind[] = ["rentals", "sales", "short-stay"];
  const listings = (await Promise.all(kinds.map(async (kind) => (await fetchPublishedListings(kind)).map((l) => ({ ...l, kind }))))).flat();
  return [
    ...pages,
    ...listings.map((l) => ({ url: `${siteUrl}${listingPath(l.kind, l.id)}`, lastModified: new Date(l.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
