import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { toLang, type Messages } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

const fr = {
  title: "Hors connexion",
  heading: "Vous êtes hors connexion",
  text: "Vérifiez votre connexion internet. Les pages déjà consultées restent disponibles.",
  retry: "Réessayer",
};
const MESSAGES: Messages<typeof fr> = {
  fr,
  en: {
    title: "Offline",
    heading: "You are offline",
    text: "Check your internet connection. Pages you have already visited remain available.",
    retry: "Try again",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: MESSAGES[toLang((await params).lang)].title };
}

/** Mise en cache par le service worker ; recopiée dans la nouvelle langue quand l'utilisateur change de langue (switchLang). */
export default async function OfflinePage({ params }: Props) {
  const m = MESSAGES[toLang((await params).lang)];
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <BrandLogo size="lg" />
      <h1 className="text-2xl font-bold text-ink">{m.heading}</h1>
      <p className="max-w-sm text-sm text-ink-muted">{m.text}</p>
      <a href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
        {m.retry}
      </a>
    </main>
  );
}
