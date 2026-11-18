import type { Messages } from "@/lib/i18n";

/** Formulaire de demande de démo (accueil). */
const fr = {
  sentTitle: "Merci, votre demande est bien reçue.",
  sentText: "Notre équipe revient vers vous sous 48 heures ouvrées.",
  sendAnother: "Envoyer une autre demande",
  fullName: "Nom complet",
  fullNameRequired: "Votre nom est requis.",
  fullNameShort: "Nom trop court.",
  email: "Email professionnel",
  emailRequired: "Votre email est requis.",
  emailInvalid: "Email invalide.",
  phone: "Téléphone (optionnel)",
  organization: "Agence ou structure (optionnel)",
  size: "Nombre de biens gérés",
  choose: "Choisir",
  sizes: { small: "1 à 10 biens", medium: "11 à 50 biens", large: "Plus de 50 biens" },
  message: "Votre besoin",
  messageRequired: "Décrivez brièvement votre besoin.",
  messageShort: "Au moins 10 caractères.",
  submit: "Envoyer ma demande",
};

export const contactMessages: Messages<typeof fr> = {
  fr,
  en: {
    sentTitle: "Thank you, we have received your request.",
    sentText: "Our team will get back to you within 2 working days.",
    sendAnother: "Send another request",
    fullName: "Full name",
    fullNameRequired: "Your name is required.",
    fullNameShort: "Name too short.",
    email: "Work email",
    emailRequired: "Your email is required.",
    emailInvalid: "Invalid email.",
    phone: "Phone (optional)",
    organization: "Agency or company (optional)",
    size: "Number of properties managed",
    choose: "Choose",
    sizes: { small: "1 to 10 properties", medium: "11 to 50 properties", large: "More than 50 properties" },
    message: "What you need",
    messageRequired: "Briefly describe what you need.",
    messageShort: "At least 10 characters.",
    submit: "Send my request",
  },
};
