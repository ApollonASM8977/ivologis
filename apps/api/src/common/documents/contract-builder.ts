import { LeaseType } from "@prisma/client";

export type ContractBlock =
  | { kind: "title"; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "meta"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "spacer" }
  | { kind: "signatures"; left: string; right: string };

export interface ContractDocumentData {
  contractNumber: string;
  type: LeaseType;
  companyName: string;
  ownerName: string;
  ownerPhone?: string | null;
  ownerAddress?: string | null;
  tenantName: string;
  tenantPhone?: string | null;
  tenantAddress?: string | null;
  tenantIdDocument?: string | null;
  propertyName: string;
  propertyAddress: string;
  propertyCommune: string;
  propertyTypeLabel: string;
  surfaceM2?: number | string | null;
  startDate: Date;
  endDate: Date;
  rentAmount: number | string;
  deposit: number | string;
  advance: number | string;
  specialConditions?: string | null;
  details?: Record<string, unknown> | null;
}

function formatXOF(amount: number | string) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(amount)))} FCFA`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

const LEASE_TYPE_TITLES: Record<LeaseType, string> = {
  HABITATION_NUE: "CONTRAT DE BAIL D'HABITATION (NON MEUBLÉ)",
  HABITATION_MEUBLEE: "CONTRAT DE BAIL D'HABITATION MEUBLÉE",
  COMMERCIAL: "CONTRAT DE BAIL COMMERCIAL",
  PROFESSIONNEL: "CONTRAT DE BAIL PROFESSIONNEL",
  TERRAIN: "CONTRAT DE BAIL DE TERRAIN NU",
};

function str(details: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const v = details?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function bool(details: Record<string, unknown> | null | undefined, key: string): boolean {
  return details?.[key] === true || details?.[key] === "true";
}

/**
 * Construit le contenu structuré d'un contrat de bail (articles, clauses)
 * selon son type. Ce contenu est ensuite rendu en PDF et en Word par les
 * services dédiés, afin de garantir que les deux formats restent identiques.
 */
export function buildContractBlocks(data: ContractDocumentData): ContractBlock[] {
  const blocks: ContractBlock[] = [];
  const d = data.details ?? {};

  blocks.push({ kind: "title", text: data.companyName });
  blocks.push({ kind: "subtitle", text: LEASE_TYPE_TITLES[data.type] });
  blocks.push({ kind: "meta", text: `N° ${data.contractNumber}` });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ENTRE LES SOUSSIGNÉS" });
  blocks.push({
    kind: "paragraph",
    text: `Le Bailleur : ${data.ownerName}${data.ownerAddress ? `, demeurant à ${data.ownerAddress}` : ""}${data.ownerPhone ? ` (Tél. ${data.ownerPhone})` : ""}, ci-après dénommé « le Bailleur »,`,
  });
  blocks.push({ kind: "paragraph", text: "D'une part," });
  blocks.push({
    kind: "paragraph",
    text: `Et le Locataire : ${data.tenantName}${data.tenantAddress ? `, demeurant à ${data.tenantAddress}` : ""}${data.tenantPhone ? ` (Tél. ${data.tenantPhone})` : ""}${data.tenantIdDocument ? `, pièce d'identité n° ${data.tenantIdDocument}` : ""}, ci-après dénommé « le Locataire »,`,
  });
  blocks.push({ kind: "paragraph", text: "D'autre part," });
  blocks.push({ kind: "paragraph", text: "Il a été convenu et arrêté ce qui suit :" });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 1 — OBJET DU CONTRAT" });
  blocks.push({
    kind: "paragraph",
    text: `Le Bailleur donne à bail au Locataire, qui accepte, le bien ci-après désigné : ${data.propertyName}, type ${data.propertyTypeLabel.toLowerCase()}, sis à ${data.propertyAddress}, commune de ${data.propertyCommune}${data.surfaceM2 ? `, d'une superficie approximative de ${data.surfaceM2} m²` : ""}.`,
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 2 — DURÉE DU BAIL" });
  blocks.push({
    kind: "paragraph",
    text: `Le présent bail est consenti pour une durée commençant le ${formatDate(data.startDate)} et se terminant le ${formatDate(data.endDate)}, sauf résiliation ou renouvellement dans les conditions prévues ci-après.`,
  });
  if (data.type === "COMMERCIAL" && bool(d, "renewalTacite")) {
    blocks.push({
      kind: "paragraph",
      text: "Conformément à l'usage du bail commercial dit « 3-6-9 », le présent contrat se renouvelle tacitement par périodes de trois (3) années, sauf congé donné par l'une des parties dans les formes et délais légaux.",
    });
  }
  const notice = str(d, "noticePeriodMonths");
  if (notice) {
    blocks.push({
      kind: "paragraph",
      text: `Toute résiliation anticipée devra être notifiée par écrit avec un préavis minimum de ${notice} mois.`,
    });
  }
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 3 — LOYER ET MODALITÉS DE PAIEMENT" });
  blocks.push({
    kind: "paragraph",
    text: `Le présent bail est consenti moyennant un loyer mensuel de ${formatXOF(data.rentAmount)}, payable d'avance au plus tard le cinq (5) de chaque mois, par tout moyen de paiement accepté par le Bailleur (espèces, virement bancaire, Orange Money, MTN Money, Moov Money, Wave).`,
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 4 — DÉPÔT DE GARANTIE ET AVANCE" });
  blocks.push({
    kind: "paragraph",
    text: `Le Locataire verse à la signature des présentes un dépôt de garantie (caution) de ${formatXOF(data.deposit)} ainsi qu'une avance de loyer de ${formatXOF(data.advance)}. Le dépôt de garantie sera restitué au Locataire dans un délai raisonnable après son départ, déduction faite des sommes dues et des réparations locatives justifiées.`,
  });
  blocks.push({ kind: "spacer" });

  // --- Articles spécifiques au type de bail ---------------------------------
  if (data.type === "HABITATION_NUE" || data.type === "HABITATION_MEUBLEE") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — DESTINATION DES LIEUX" });
    const occupants = str(d, "occupantsCount");
    blocks.push({
      kind: "paragraph",
      text: `Les lieux loués sont à usage exclusif d'habitation${occupants ? ` pour ${occupants} occupant(s) au maximum` : ""}. Toute sous-location ou cession du bail est interdite sauf accord écrit préalable du Bailleur.`,
    });

    if (data.type === "HABITATION_MEUBLEE") {
      blocks.push({ kind: "heading", text: "ARTICLE 6 — INVENTAIRE DU MOBILIER" });
      const inventory = str(d, "furnitureInventory");
      blocks.push({
        kind: "paragraph",
        text: inventory
          ? `Le logement est loué meublé. L'inventaire du mobilier et des équipements fournis est le suivant : ${inventory}.`
          : "Le logement est loué meublé. Un inventaire contradictoire du mobilier sera annexé au présent contrat lors de l'état des lieux d'entrée.",
      });
    }

    const guarantorName = str(d, "guarantorName");
    if (guarantorName) {
      blocks.push({ kind: "heading", text: `ARTICLE ${data.type === "HABITATION_MEUBLEE" ? 7 : 6} — CAUTION SOLIDAIRE` });
      blocks.push({
        kind: "paragraph",
        text: `${guarantorName}${str(d, "guarantorPhone") ? `, téléphone ${str(d, "guarantorPhone")}` : ""}${str(d, "guarantorAddress") ? `, demeurant à ${str(d, "guarantorAddress")}` : ""}, se porte garant solidaire du Locataire pour l'exécution de toutes les obligations résultant du présent bail, notamment le paiement du loyer et des charges.`,
      });
    }
  }

  if (data.type === "COMMERCIAL") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — DESTINATION COMMERCIALE" });
    const activity = str(d, "businessActivity") ?? "activité commerciale à préciser";
    const tradeName = str(d, "tradeName");
    blocks.push({
      kind: "paragraph",
      text: `Les lieux loués sont destinés exclusivement à l'exercice de l'activité suivante : ${activity}${tradeName ? `, sous l'enseigne « ${tradeName} »` : ""}. Tout changement de destination devra faire l'objet d'un accord écrit préalable du Bailleur.`,
    });

    const pasDePorte = str(d, "pasDePorte");
    if (pasDePorte) {
      blocks.push({ kind: "heading", text: "ARTICLE 6 — DROIT AU BAIL" });
      blocks.push({
        kind: "paragraph",
        text: `Le Locataire verse au Bailleur, en sus du dépôt de garantie, un droit au bail (pas-de-porte) de ${formatXOF(pasDePorte)} à la signature des présentes.`,
      });
    }
  }

  if (data.type === "PROFESSIONNEL") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — DESTINATION PROFESSIONNELLE" });
    const profession = str(d, "profession") ?? "profession à préciser";
    const order = str(d, "professionalOrder");
    blocks.push({
      kind: "paragraph",
      text: `Les lieux loués sont destinés exclusivement à l'exercice de la profession de ${profession}${order ? ` (ordre professionnel / agrément n° ${order})` : ""}. Toute autre activité est exclue sauf accord écrit du Bailleur.`,
    });
  }

  if (data.type === "TERRAIN") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — USAGE DU TERRAIN" });
    const landUse = str(d, "landUse") ?? "usage à préciser";
    const titleRef = str(d, "titleReference");
    blocks.push({
      kind: "paragraph",
      text: `Le terrain loué est destiné à l'usage suivant : ${landUse}.${titleRef ? ` Référence du titre de propriété / ACD / lettre d'attribution : ${titleRef}.` : ""}`,
    });
    if (bool(d, "constructionPermitRequired")) {
      blocks.push({
        kind: "paragraph",
        text: "Le Locataire s'engage à obtenir toute autorisation de construire nécessaire auprès des autorités compétentes avant d'entreprendre quelque construction que ce soit sur le terrain loué.",
      });
    }
  }
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 7 — OBLIGATIONS DU BAILLEUR" });
  blocks.push({
    kind: "paragraph",
    text: "Le Bailleur s'engage à délivrer le bien en bon état d'usage et de réparation, à en assurer la jouissance paisible au Locataire pendant toute la durée du bail, et à effectuer les réparations autres que locatives.",
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 8 — OBLIGATIONS DU LOCATAIRE" });
  blocks.push({
    kind: "paragraph",
    text: "Le Locataire s'engage à payer le loyer aux termes convenus, à user paisiblement des lieux loués, à les entretenir et à y effectuer les réparations locatives, à ne pas y apporter de modification sans accord écrit du Bailleur, et à restituer le bien en bon état à l'expiration du bail.",
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 9 — CLAUSE RÉSOLUTOIRE" });
  blocks.push({
    kind: "paragraph",
    text: "À défaut de paiement du loyer à son échéance, ou en cas d'inexécution d'une des clauses du présent contrat, et un mois après un commandement de payer ou une mise en demeure restée infructueuse, le présent bail sera résilié de plein droit si bon semble au Bailleur, sans préjudice de tous dommages et intérêts.",
  });

  if (data.specialConditions) {
    blocks.push({ kind: "spacer" });
    blocks.push({ kind: "heading", text: "ARTICLE 10 — CONDITIONS PARTICULIÈRES" });
    blocks.push({ kind: "paragraph", text: data.specialConditions });
  }

  blocks.push({ kind: "spacer" });
  blocks.push({
    kind: "paragraph",
    text: `Fait à Abidjan, en deux exemplaires originaux, le ${formatDate(new Date())}.`,
  });
  blocks.push({ kind: "spacer" });
  blocks.push({ kind: "signatures", left: "Le Bailleur", right: "Le Locataire" });

  return blocks;
}
