import Link from "next/link";
import { cookies } from "next/headers";
import { BrandLogo } from "@/components/brand-logo";
import { HouseLoader } from "@/components/ui/house-loader";
import { LANG_COOKIE, type Messages } from "@/lib/i18n";

const fr = {
  code: "Erreur 404",
  title: "Cette page n'existe pas (ou plus).",
  text: "Le lien est peut-être incomplet, ou l'annonce a été retirée. Vous pouvez repartir de l'accueil ou parcourir le catalogue.",
  home: "Retour à l'accueil",
  catalogue: "Voir les annonces",
  building: "La page est encore en construction",
};
const MESSAGES: Messages<typeof fr> = {
  fr,
  en: {
    code: "Error 404",
    title: "This page does not exist (anymore).",
    text: "The link may be incomplete, or the listing has been removed. You can start again from the home page or browse the listings.",
    home: "Back to home",
    catalogue: "See listings",
    building: "This page is still under construction",
  },
};

/** Page introuvable : la langue vient du cookie (Next ne transmet pas les paramètres de route à cette page). */
export default async function NotFound() {
  const m = MESSAGES[(await cookies()).get(LANG_COOKIE)?.value === "en" ? "en" : "fr"];
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 py-16 text-center">
      <Link href="/" aria-label="IVOLOGIS">
        <BrandLogo size="lg" />
      </Link>
      <HouseLoader label={m.building} size={88} />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.code}</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{m.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">{m.text}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
          {m.home}
        </Link>
        <Link href="/catalogue" className="text-sm font-semibold text-primary hover:underline">
          {m.catalogue}
        </Link>
      </div>
    </main>
  );
}
