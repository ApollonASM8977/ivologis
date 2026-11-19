import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import { authMeta } from "@/messages/auth-meta";

// La page est un composant client : ses métadonnées (titre, aperçu des liens partagés) sont déclarées ici.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = authMeta[lang].login;
  return pageMetadata(lang, "/login", m.title, m.description);
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
