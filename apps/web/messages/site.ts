import type { Messages } from "@/lib/i18n";

/** Textes communs à tout le site : métadonnées, en-tête, pied de page, sélecteur de langue. */
const fr = {
  meta: {
    title: "IVOLOGIS, gestion immobilière en Côte d'Ivoire",
    description: "Biens, baux, loyers, travaux et relevés propriétaires : la plateforme de gestion locative pour la Côte d'Ivoire.",
    ogTitle: "IVOLOGIS : la gestion locative, simple et sécurisée",
    ogDescription: "Biens, baux, loyers et relevés propriétaires pour la Côte d'Ivoire.",
    twitterDescription: "Gestion locative pour la Côte d'Ivoire.",
    ogLocale: "fr_CI",
  },
  skipToContent: "Aller au contenu",
  language: { label: "Langue", fr: "Français", en: "English", switchTo: "Passer en anglais" },
  consent: {
    label: "Cookies et mesure d'audience",
    text: "Ce site n'utilise que des cookies techniques (connexion, langue) et une mesure d'audience anonyme, sans cookie.",
    more: "En savoir plus",
    accept: "D'accord",
    refuse: "Refuser la mesure",
  },
};

export const siteMessages: Messages<typeof fr> = {
  fr,
  en: {
    meta: {
      title: "IVOLOGIS, property management in Côte d'Ivoire",
      description: "Properties, leases, rent, repairs and owner statements: the rental management platform for Côte d'Ivoire.",
      ogTitle: "IVOLOGIS: rental management, simple and secure",
      ogDescription: "Properties, leases, rent and owner statements for Côte d'Ivoire.",
      twitterDescription: "Rental management for Côte d'Ivoire.",
      ogLocale: "en_GB",
    },
    skipToContent: "Skip to content",
    language: { label: "Language", fr: "Français", en: "English", switchTo: "Passer en français" },
    consent: {
      label: "Cookies and audience measurement",
      text: "This site only uses technical cookies (sign-in, language) and anonymous audience measurement, without cookies.",
      more: "Learn more",
      accept: "OK",
      refuse: "Refuse measurement",
    },
  },
};
