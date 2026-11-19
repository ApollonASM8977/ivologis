import type { Messages } from "@/lib/i18n";

/** En-tête et pied de page du site public. */
const fr = {
  nav: {
    catalogue: "Catalogue",
    features: "Fonctionnalités",
    audience: "Pour qui",
    pricing: "Tarifs",
    security: "Sécurité",
    faq: "FAQ",
    main: "Navigation principale",
    mobile: "Navigation mobile",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  login: "Se connecter",
  mySpace: "Mon espace",
  demo: "Demander une démo",
  footer: {
    tagline: "Gestion immobilière locative pour la Côte d'Ivoire.",
    product: "Produit",
    clientArea: "Espace client",
    forgotPassword: "Mot de passe oublié",
    trackRequest: "Suivre ma demande",
    legal: "Légal",
    verification: "Vérification des annonces",
    legalNotice: "Mentions légales",
    privacy: "Confidentialité",
    terms: "Conditions générales",
    rights: "Tous droits réservés.",
  },
};

export const marketingMessages: Messages<typeof fr> = {
  fr,
  en: {
    nav: {
      catalogue: "Listings",
      features: "Features",
      audience: "Who it's for",
      pricing: "Pricing",
      security: "Security",
      faq: "FAQ",
      main: "Main navigation",
      mobile: "Mobile navigation",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    login: "Sign in",
    mySpace: "My account",
    demo: "Request a demo",
    footer: {
      tagline: "Rental property management for Côte d'Ivoire.",
      product: "Product",
      clientArea: "Client area",
      forgotPassword: "Forgot password",
      trackRequest: "Track my request",
      legal: "Legal",
      verification: "Listing verification",
      legalNotice: "Legal notice",
      privacy: "Privacy",
      terms: "Terms of use",
      rights: "All rights reserved.",
    },
  },
};
