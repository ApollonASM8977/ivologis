import type { Metadata } from "next";
import { toLang } from "@/lib/i18n";
import { homeMessages } from "@/messages/home";
import { previewMessages } from "@/messages/preview";
import { AnimationsPreview } from "@/components/preview/animations-preview";

type Props = { params: Promise<{ lang: string }> };

// Aperçu à valider (D-10) : non indexé, absent du plan du site et des menus.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: previewMessages[toLang((await params).lang)].metaTitle, robots: { index: false, follow: false } };
}

export default async function AnimationsPreviewPage({ params }: Props) {
  const lang = toLang((await params).lang);
  return <AnimationsPreview m={homeMessages[lang]} p={previewMessages[lang]} lang={lang} />;
}
