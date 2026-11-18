import type { Messages } from "@/lib/i18n";

/** Page d'accueil. Les listes suivent l'ordre des icônes définies dans la page. */
const fr = {
  hero: {
    badge: "Conçu pour la location en Côte d'Ivoire",
    title: "La gestion locative, ",
    titleAccent: "simple et sécurisée.",
    lead: "Biens, locataires, baux, loyers, travaux et relevés propriétaires réunis dans une seule plateforme, pour les agences, les propriétaires et leurs locataires.",
    demo: "Demander une démo",
    security: "Voir la sécurité",
  },
  mockup: {
    overview: "Vue d'ensemble",
    upToDate: "À jour",
    kpis: ["Biens", "Loyers encaissés", "Retards"],
    rentValue: "9,4 M",
    events: ["Quittance émise · Villa Riviera 3", "Demande de maintenance · Plomberie", "Bail renouvelé · Studio Angré"],
  },
  catalog: {
    eyebrow: "Catalogue public",
    title: "Vous cherchez un bien ou un séjour ?",
    lead: "Parcourez nos annonces sans créer de compte : logements à louer, terrains et biens à vendre, résidences meublées à la nuitée.",
    see: "Voir les annonces",
    offers: [
      { title: "Logements à louer", text: "Studios, appartements, villas au mois : loyer, avance et caution affichés, frais d'agence encadrés. Demandez une visite sans créer de compte." },
      { title: "Biens à vendre", text: "Terrains, villas, appartements et locaux, publiés après contrôle du document foncier. Demandez un rendez-vous de visite en un clic." },
      { title: "Résidences meublées", text: "Réservez un séjour à la nuitée, façon Airbnb simplifié : choisissez vos dates, envoyez votre demande, le paiement se règle sur place ou avant l'arrivée." },
    ],
  },
  payments: { title: "Moyens de paiement acceptés par l'agence", aria: "Moyens de paiement pris en charge", bankTransfer: "Virement bancaire" },
  features: {
    eyebrow: "Fonctionnalités",
    title: "Tout le cycle locatif, sans tableur.",
    items: [
      { title: "Biens immobiliers", text: "Fiche complète : adresse précise, photos, étage, équipements, meublé, repère pour trouver le bien." },
      { title: "Locataires et baux", text: "Dossier locataire avec garant et revenus, baux d'habitation, commercial, professionnel ou terrain, prêts à signer." },
      { title: "Loyers et paiements", text: "Suivi des loyers et des retards, relance des impayés, quittance PDF émise dès qu'un paiement est confirmé." },
      { title: "Maintenance", text: "Demandes signalées par les locataires, assignation à un technicien, coûts estimés et réels, fil de commentaires." },
      { title: "Relevés propriétaires", text: "Synthèse des revenus, commission et dépenses, exportable en PDF ou CSV compatible Excel." },
      { title: "Documents", text: "Contrats et quittances exportables en PDF et Word, avec les informations de votre agence." },
    ],
  },
  steps: {
    eyebrow: "Comment ça marche",
    title: "Trois étapes pour démarrer.",
    items: [
      { title: "Créez votre parc", text: "Ajoutez vos propriétaires et leurs biens, avec photos et caractéristiques." },
      { title: "Associez baux et locataires", text: "Choisissez le type de bail : les champs utiles apparaissent automatiquement." },
      { title: "Pilotez au quotidien", text: "Loyers, travaux et documents suivis au même endroit, pour tous les acteurs." },
    ],
  },
  audience: {
    eyebrow: "Pour qui",
    title: "Chacun voit ce qui le concerne, et seulement cela.",
    tabsLabel: "Profils",
    items: [
      {
        label: "Agences",
        title: "Agences immobilières",
        intro: "Une équipe, des permissions précises et une vue claire sur tous les loyers.",
        items: ["Gestion multi-agents avec permissions précises", "Journal d'activité des actions sensibles", "Vue d'ensemble des loyers en retard"],
      },
      {
        label: "Propriétaires",
        title: "Propriétaires",
        intro: "Suivez vos biens depuis un espace dédié, sans dépendre de l'agence pour chaque information.",
        items: ["Espace dédié, accès limité à vos seuls biens", "Relevé financier et suivi des travaux", "Contrats et quittances téléchargeables"],
      },
      {
        label: "Locataires",
        title: "Locataires",
        intro: "Votre logement, votre bail et vos quittances, accessibles à tout moment.",
        items: ["Quittances et contrat à portée de main", "Signalement de panne avec photos", "Déclaration de paiement suivie par l'agence"],
      },
    ],
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Une formule adaptée à la taille de votre parc.",
    lead: "Les tarifs sont communiqués après une démo, selon le nombre de biens et vos besoins.",
    onQuote: "Sur devis",
    cta: "Demander un devis",
    tiers: [
      { name: "Démarrage", size: "1 à 10 biens", items: ["Toutes les fonctionnalités", "Documents PDF et Word", "Espace propriétaire et locataire"] },
      { name: "Croissance", size: "11 à 50 biens", items: ["Tout Démarrage", "Équipe avec permissions", "Relevés et exports avancés"] },
      { name: "Entreprise", size: "Plus de 50 biens", items: ["Tout Croissance", "Accompagnement à la mise en place", "Adaptations sur mesure"] },
    ],
  },
  security: {
    eyebrow: "Sécurité",
    title: "Vos données restent à leur place.",
    lead: "Accès par rôle, isolation stricte entre propriétaires et locataires, mots de passe hachés, double authentification et journal des actions sensibles.",
    link: "Lire la page sécurité →",
    items: ["Mots de passe hachés", "Double authentification", "Accès par rôle", "Journal d'activité"],
  },
  faq: {
    eyebrow: "Questions fréquentes",
    title: "Vos questions, nos réponses.",
    items: [
      {
        q: "Mes données sont-elles protégées ?",
        a: "Les mots de passe sont stockés sous forme hachée, chaque propriétaire et chaque locataire n'accède qu'à ses propres données, et les actions sensibles sont tracées dans un journal. La double authentification est disponible. Le détail est sur la page Sécurité.",
      },
      {
        q: "Les locataires peuvent-ils payer leur loyer en ligne ?",
        a: "Pas encore directement. Le locataire paie par Orange Money, MTN MoMo, Moov Money ou Wave au numéro de l'agence, puis déclare la transaction dans son espace. L'agence la vérifie et la quittance est émise automatiquement. Le paiement en ligne direct est prévu.",
      },
      {
        q: "Puis-je exporter mes relevés et mes documents ?",
        a: "Oui. Les relevés propriétaires se téléchargent en PDF ou en CSV (compatible Excel), et les contrats et quittances en PDF ou Word.",
      },
      {
        q: "Mes propriétaires ont-ils un accès ?",
        a: "Oui, chaque propriétaire dispose d'un espace dédié pour suivre ses biens, ses paiements, ses contrats et ses demandes de maintenance.",
      },
      {
        q: "Comment démarrer ?",
        a: "Demandez une démo : nous échangeons sur la taille de votre parc, puis nous vous accompagnons pour importer vos biens et vos baux.",
      },
    ],
  },
  contact: {
    eyebrow: "Demande de démo",
    title: "Parlons de votre parc.",
    lead: "Décrivez votre activité en quelques lignes. Nous revenons vers vous pour une démonstration adaptée à vos biens.",
    already: "Déjà client ?",
    loginLink: "Connectez-vous à votre espace",
  },
};

export const homeMessages: Messages<typeof fr> = {
  fr,
  en: {
    hero: {
      badge: "Built for renting in Côte d'Ivoire",
      title: "Rental management, ",
      titleAccent: "simple and secure.",
      lead: "Properties, tenants, leases, rent, repairs and owner statements in a single platform, for agencies, owners and their tenants.",
      demo: "Request a demo",
      security: "See our security",
    },
    mockup: {
      overview: "Overview",
      upToDate: "Up to date",
      kpis: ["Properties", "Rent collected", "Late payments"],
      rentValue: "9.4 M",
      events: ["Receipt issued · Villa Riviera 3", "Maintenance request · Plumbing", "Lease renewed · Studio Angré"],
    },
    catalog: {
      eyebrow: "Public listings",
      title: "Looking for a home or a stay?",
      lead: "Browse our listings without creating an account: homes to rent, land and property for sale, furnished residences by the night.",
      see: "See listings",
      offers: [
        { title: "Homes to rent", text: "Studios, flats and villas by the month: rent, advance and deposit shown upfront, capped agency fees. Request a viewing without creating an account." },
        { title: "Property for sale", text: "Land, villas, flats and commercial premises, published after the land title has been checked. Book a viewing in one click." },
        { title: "Furnished residences", text: "Book a stay by the night, like a simpler Airbnb: pick your dates, send your request, and pay on site or before arrival." },
      ],
    },
    payments: { title: "Payment methods accepted by the agency", aria: "Supported payment methods", bankTransfer: "Bank transfer" },
    features: {
      eyebrow: "Features",
      title: "The whole rental cycle, no spreadsheets.",
      items: [
        { title: "Properties", text: "Complete records: exact address, photos, floor, amenities, furnishing, landmark to find the place." },
        { title: "Tenants and leases", text: "Tenant files with guarantor and income, residential, commercial, professional or land leases, ready to sign." },
        { title: "Rent and payments", text: "Track rent and late payments, chase arrears, PDF receipt issued as soon as a payment is confirmed." },
        { title: "Maintenance", text: "Requests reported by tenants, assigned to a technician, estimated and actual costs, comment thread." },
        { title: "Owner statements", text: "Summary of income, commission and expenses, exportable as PDF or Excel-compatible CSV." },
        { title: "Documents", text: "Contracts and receipts exportable as PDF and Word, with your agency's details." },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Three steps to get started.",
      items: [
        { title: "Build your portfolio", text: "Add your owners and their properties, with photos and features." },
        { title: "Link leases and tenants", text: "Choose the lease type: the relevant fields appear automatically." },
        { title: "Run it day to day", text: "Rent, repairs and documents tracked in one place, for everyone involved." },
      ],
    },
    audience: {
      eyebrow: "Who it's for",
      title: "Everyone sees what concerns them, and only that.",
      tabsLabel: "Profiles",
      items: [
        {
          label: "Agencies",
          title: "Real estate agencies",
          intro: "One team, precise permissions and a clear view of all rent.",
          items: ["Multi-agent management with precise permissions", "Activity log of sensitive actions", "Overview of late rent"],
        },
        {
          label: "Owners",
          title: "Owners",
          intro: "Follow your properties from a dedicated space, without asking the agency for every detail.",
          items: ["Dedicated space, access limited to your own properties", "Financial statement and repair tracking", "Downloadable contracts and receipts"],
        },
        {
          label: "Tenants",
          title: "Tenants",
          intro: "Your home, your lease and your receipts, available at any time.",
          items: ["Receipts and lease at your fingertips", "Report a fault with photos", "Payment declarations followed up by the agency"],
        },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "A plan sized to your portfolio.",
      lead: "Prices are shared after a demo, based on the number of properties and your needs.",
      onQuote: "On quote",
      cta: "Request a quote",
      tiers: [
        { name: "Starter", size: "1 to 10 properties", items: ["All features", "PDF and Word documents", "Owner and tenant spaces"] },
        { name: "Growth", size: "11 to 50 properties", items: ["Everything in Starter", "Team with permissions", "Advanced statements and exports"] },
        { name: "Enterprise", size: "More than 50 properties", items: ["Everything in Growth", "Onboarding support", "Tailored adjustments"] },
      ],
    },
    security: {
      eyebrow: "Security",
      title: "Your data stays where it belongs.",
      lead: "Role-based access, strict separation between owners and tenants, hashed passwords, two-factor authentication and a log of sensitive actions.",
      link: "Read the security page →",
      items: ["Hashed passwords", "Two-factor authentication", "Role-based access", "Activity log"],
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Your questions, our answers.",
      items: [
        {
          q: "Is my data protected?",
          a: "Passwords are stored hashed, each owner and tenant can only access their own data, and sensitive actions are recorded in a log. Two-factor authentication is available. Details are on the Security page.",
        },
        {
          q: "Can tenants pay their rent online?",
          a: "Not directly yet. Tenants pay by Orange Money, MTN MoMo, Moov Money or Wave to the agency's number, then declare the transaction in their space. The agency checks it and the receipt is issued automatically. Direct online payment is planned.",
        },
        {
          q: "Can I export my statements and documents?",
          a: "Yes. Owner statements can be downloaded as PDF or CSV (Excel-compatible), and contracts and receipts as PDF or Word.",
        },
        {
          q: "Do my owners get access?",
          a: "Yes, each owner has a dedicated space to follow their properties, payments, contracts and maintenance requests.",
        },
        {
          q: "How do I get started?",
          a: "Request a demo: we discuss the size of your portfolio, then help you import your properties and leases.",
        },
      ],
    },
    contact: {
      eyebrow: "Demo request",
      title: "Let's talk about your portfolio.",
      lead: "Describe your business in a few lines. We will get back to you with a demo tailored to your properties.",
      already: "Already a client?",
      loginLink: "Sign in to your space",
    },
  },
};
