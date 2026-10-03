import { BrandLogo } from "@/components/brand-logo";

export const metadata = { title: "Hors connexion — IVOLOGIS" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <BrandLogo size="lg" />
      <h1 className="text-2xl font-bold text-ink">Vous êtes hors connexion</h1>
      <p className="max-w-sm text-sm text-ink-muted">Vérifiez votre connexion internet. Les pages déjà consultées restent disponibles.</p>
      <a href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">Réessayer</a>
    </main>
  );
}
