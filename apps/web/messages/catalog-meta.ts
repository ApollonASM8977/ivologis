import type { Messages } from "@/lib/i18n";

/** Titres et descriptions (Google, partages) des pages du catalogue public. */
const fr = {
  hub: {
    title: "Annonces immobilières à Abidjan et en Côte d'Ivoire",
    description: "Logements à louer, terrains et maisons à vendre, résidences meublées : annonces publiées et vérifiées par l'agence, prix en FCFA.",
  },
  rentals: {
    title: "Appartements et maisons à louer à Abidjan",
    description: "Logements à louer au mois à Abidjan : loyer, avance et caution affichés, frais d'agence encadrés. Demandez une visite sans créer de compte.",
    fallback: "Logement à louer",
  },
  sales: {
    title: "Terrains et maisons à vendre en Côte d'Ivoire",
    description: "Terrains, villas et appartements à vendre à Abidjan et en Côte d'Ivoire, publiés après contrôle du document foncier (ACD, titre foncier).",
    fallback: "Bien à vendre",
  },
  shortStay: {
    title: "Résidences meublées à la nuitée",
    description: "Résidences meublées à louer à la nuitée à Abidjan et sur la côte, disponibilités en ligne, réservation sans compte.",
    fallback: "Résidence meublée",
  },
  myRequests: { title: "Mes demandes" },
};

export const catalogMeta: Messages<typeof fr> = {
  fr,
  en: {
    hub: {
      title: "Property listings in Abidjan and Côte d'Ivoire",
      description: "Homes to rent, land and houses for sale, furnished residences: listings published and verified by the agency, prices in FCFA.",
    },
    rentals: {
      title: "Flats and houses to rent in Abidjan",
      description: "Homes to rent by the month in Abidjan: rent, advance and deposit shown upfront, capped agency fees. Request a viewing without creating an account.",
      fallback: "Home to rent",
    },
    sales: {
      title: "Land and houses for sale in Côte d'Ivoire",
      description: "Land, villas and flats for sale in Abidjan and Côte d'Ivoire, published after the land document has been checked (ACD, land title).",
      fallback: "Property for sale",
    },
    shortStay: {
      title: "Furnished residences by the night",
      description: "Furnished residences to rent by the night in Abidjan and on the coast, availability online, booking without an account.",
      fallback: "Furnished residence",
    },
    myRequests: { title: "My requests" },
  },
};
