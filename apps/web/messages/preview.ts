import type { Messages } from "@/lib/i18n";

/** Aperçu des animations (branche preview/animations, page non publiée). */
const fr = {
  metaTitle: "Aperçu des animations",
  banner: "Aperçu des animations : page non publiée et non indexée. Chaque bloc indique la bibliothèque utilisée.",
  back: "Voir l'accueil actuel",
  rotate: ["simple et sécurisée.", "pour les agences.", "pour les propriétaires.", "pour les locataires."],
  statsTitle: "IVOLOGIS en chiffres",
  stats: [
    { value: 3, label: "types d'annonces : location, vente, séjour" },
    { value: 4, label: "espaces : agence, propriétaire, locataire, visiteur" },
    { value: 2, label: "langues : français et anglais" },
    { value: 9, label: "mesures de sécurité actives" },
  ],
  flowTitle: "Tout circule au même endroit.",
  flowLead: "L'agence, le propriétaire et le locataire partagent la même information, chacun avec ses droits.",
  flowLeft: ["Agence", "Propriétaire", "Locataire"],
  flowRight: ["Quittance PDF", "Mobile Money", "Maintenance"],
  menuTitle: "Menu aux lettres qui roulent (survolez les mots)",
  menu: ["Louer", "Acheter", "Séjourner", "Contact"],
  endTitle: "Prêt à essayer ?",
};

export const previewMessages: Messages<typeof fr> = {
  fr,
  en: {
    metaTitle: "Animation preview",
    banner: "Animation preview: unpublished, not indexed. Each block names the library it uses.",
    back: "See the current homepage",
    rotate: ["simple and secure.", "for agencies.", "for owners.", "for tenants."],
    statsTitle: "IVOLOGIS in numbers",
    stats: [
      { value: 3, label: "listing types: rental, sale, short stay" },
      { value: 4, label: "spaces: agency, owner, tenant, visitor" },
      { value: 2, label: "languages: French and English" },
      { value: 9, label: "active security measures" },
    ],
    flowTitle: "Everything flows in one place.",
    flowLead: "The agency, the owner and the tenant share the same information, each with their own rights.",
    flowLeft: ["Agency", "Owner", "Tenant"],
    flowRight: ["PDF receipt", "Mobile Money", "Maintenance"],
    menuTitle: "Rolling-letter menu (hover the words)",
    menu: ["Rent", "Buy", "Stay", "Contact"],
    endTitle: "Ready to try it?",
  },
};
