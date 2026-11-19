import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { siteMessages } from "@/messages/site";
import { alt as imageAlt, contentType as imageType, size as imageSize } from "@/app/opengraph-image";

/**
 * Métadonnées d'une page publique : titre, description, adresse canonique et aperçu des liens partagés
 * (Open Graph, X) avec l'adresse de la page elle-même. Sans cela, la page hérite de l'aperçu de l'accueil
 * (`og:url` = accueil) et un lien partagé s'affiche comme l'accueil.
 * `path` = adresse publique, sans préfixe de langue (la langue passe par un cookie, voir `middleware.ts`).
 * Next.js remplace en entier l'objet `openGraph` du gabarit et ne remet pas l'image de `app/opengraph-image` :
 * le type, la langue, le nom du site et l'image d'aperçu sont donc repris ici.
 * `image` : adresse absolue d'une image propre à la page (photo d'annonce) ; sinon l'image générale du site.
 */
export function pageMetadata(lang: Lang, path: string, title: string, description?: string, image?: string): Metadata {
  const meta = siteMessages[lang].meta;
  const url = `${siteUrl}${path}`;
  const summary = description ?? meta.ogDescription;
  const images = image
    ? [{ url: image }]
    : [{ url: `${siteUrl}/opengraph-image`, width: imageSize.width, height: imageSize.height, type: imageType, alt: imageAlt }];
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: { type: "website", locale: meta.ogLocale, siteName: "IVOLOGIS", url, title, description: summary, images },
    twitter: { card: "summary_large_image", title, description: summary, images },
  };
}
