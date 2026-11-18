import { LeaseType } from "@prisma/client";
import { locale, requestLang, tr } from "../i18n/i18n";

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
  companyAddress?: string | null;
  companyContact?: string | null;
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
  return `${new Intl.NumberFormat(locale()).format(Math.round(Number(amount)))} FCFA`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(locale(), { dateStyle: "long" }).format(date);
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
  const companyLine = [data.companyAddress, data.companyContact].filter(Boolean).join(" · ");
  if (companyLine) blocks.push({ kind: "meta", text: companyLine });
  blocks.push({ kind: "subtitle", text: tr(LEASE_TYPE_TITLES[data.type]) });
  blocks.push({ kind: "meta", text: `N° ${data.contractNumber}` });
  // Contrat de droit ivoirien rédigé en français : la version anglaise est une traduction d'information.
  if (requestLang() === "en") blocks.push({ kind: "meta", text: "English translation provided for information only. The French version of this contract prevails." });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: tr("ENTRE LES SOUSSIGNÉS") });
  blocks.push({
    kind: "paragraph",
    text: tr("Le Bailleur : {0}{1}{2}, ci-après dénommé « le Bailleur »,", data.ownerName, data.ownerAddress ? tr(", demeurant à {0}", data.ownerAddress) : "", data.ownerPhone ? tr(" (Tél. {0})", data.ownerPhone) : ""),
  });
  blocks.push({ kind: "paragraph", text: tr("D'une part,") });
  blocks.push({
    kind: "paragraph",
    text: tr("Et le Locataire : {0}{1}{2}{3}, ci-après dénommé « le Locataire »,", data.tenantName, data.tenantAddress ? tr(", demeurant à {0}", data.tenantAddress) : "", data.tenantPhone ? tr(" (Tél. {0})", data.tenantPhone) : "", data.tenantIdDocument ? tr(", pièce d'identité n° {0}", data.tenantIdDocument) : ""),
  });
  blocks.push({ kind: "paragraph", text: tr("D'autre part,") });
  blocks.push({ kind: "paragraph", text: tr("Il a été convenu et arrêté ce qui suit :") });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 1 — OBJET DU CONTRAT" });
  blocks.push({
    kind: "paragraph",
    text: tr("Le Bailleur donne à bail au Locataire, qui accepte, le bien ci-après désigné : {0}, type {1}, sis à {2}, commune de {3}{4}.", data.propertyName, tr(data.propertyTypeLabel).toLowerCase(), data.propertyAddress, data.propertyCommune, data.surfaceM2 ? tr(", d'une superficie approximative de {0} m²", data.surfaceM2) : ""),
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: tr("ARTICLE 2 — DURÉE DU BAIL") });
  blocks.push({
    kind: "paragraph",
    text: tr("Le présent bail est consenti pour une durée commençant le {0} et se terminant le {1}, sauf résiliation ou renouvellement dans les conditions prévues ci-après.", formatDate(data.startDate), formatDate(data.endDate)),
  });
  if (data.type === "COMMERCIAL" && bool(d, "renewalTacite")) {
    blocks.push({
      kind: "paragraph",
      text: tr("Conformément à l'usage du bail commercial dit « 3-6-9 », le présent contrat se renouvelle tacitement par périodes de trois (3) années, sauf congé donné par l'une des parties dans les formes et délais légaux."),
    });
  }
  const notice = str(d, "noticePeriodMonths");
  if (notice) {
    blocks.push({
      kind: "paragraph",
      text: tr("Toute résiliation anticipée devra être notifiée par écrit avec un préavis minimum de {0} mois.", notice),
    });
  }
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: tr("ARTICLE 3 — LOYER ET MODALITÉS DE PAIEMENT") });
  blocks.push({
    kind: "paragraph",
    text: tr("Le présent bail est consenti moyennant un loyer mensuel de {0}, payable d'avance au plus tard le cinq (5) de chaque mois, par tout moyen de paiement accepté par le Bailleur (espèces, virement bancaire, Orange Money, MTN Money, Moov Money, Wave).", formatXOF(data.rentAmount)),
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: tr("ARTICLE 4 — DÉPÔT DE GARANTIE ET AVANCE") });
  blocks.push({
    kind: "paragraph",
    text: tr("Le Locataire verse à la signature des présentes un dépôt de garantie (caution) de {0} ainsi qu'une avance de loyer de {1}. Le dépôt de garantie sera restitué au Locataire dans un délai raisonnable après son départ, déduction faite des sommes dues et des réparations locatives justifiées.", formatXOF(data.deposit), formatXOF(data.advance)),
  });
  blocks.push({ kind: "spacer" });

  // --- Articles spécifiques au type de bail ---------------------------------
  if (data.type === "HABITATION_NUE" || data.type === "HABITATION_MEUBLEE") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — DESTINATION DES LIEUX" });
    const occupants = str(d, "occupantsCount");
    blocks.push({
      kind: "paragraph",
      text: tr("Les lieux loués sont à usage exclusif d'habitation{0}. Toute sous-location ou cession du bail est interdite sauf accord écrit préalable du Bailleur.", occupants ? tr(" pour {0} occupant(s) au maximum", occupants) : ""),
    });

    if (data.type === "HABITATION_MEUBLEE") {
      blocks.push({ kind: "heading", text: "ARTICLE 6 — INVENTAIRE DU MOBILIER" });
      const inventory = str(d, "furnitureInventory");
      blocks.push({
        kind: "paragraph",
        text: inventory
          ? tr("Le logement est loué meublé. L'inventaire du mobilier et des équipements fournis est le suivant : {0}.", inventory)
          : tr("Le logement est loué meublé. Un inventaire contradictoire du mobilier sera annexé au présent contrat lors de l'état des lieux d'entrée."),
      });
    }

    const guarantorName = str(d, "guarantorName");
    if (guarantorName) {
      blocks.push({ kind: "heading", text: tr("ARTICLE {0} — CAUTION SOLIDAIRE", data.type === "HABITATION_MEUBLEE" ? 7 : 6) });
      blocks.push({
        kind: "paragraph",
        text: tr("{0}{1}{2}, se porte garant solidaire du Locataire pour l'exécution de toutes les obligations résultant du présent bail, notamment le paiement du loyer et des charges.", guarantorName, str(d, "guarantorPhone") ? tr(", téléphone {0}", str(d, "guarantorPhone")) : "", str(d, "guarantorAddress") ? tr(", demeurant à {0}", str(d, "guarantorAddress")) : ""),
      });
    }
  }

  if (data.type === "COMMERCIAL") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — DESTINATION COMMERCIALE" });
    const activity = str(d, "businessActivity") ?? tr("activité commerciale à préciser");
    const tradeName = str(d, "tradeName");
    blocks.push({
      kind: "paragraph",
      text: tr("Les lieux loués sont destinés exclusivement à l'exercice de l'activité suivante : {0}{1}. Tout changement de destination devra faire l'objet d'un accord écrit préalable du Bailleur.", activity, tradeName ? tr(", sous l'enseigne « {0} »", tradeName) : ""),
    });

    const pasDePorte = str(d, "pasDePorte");
    if (pasDePorte) {
      blocks.push({ kind: "heading", text: "ARTICLE 6 — DROIT AU BAIL" });
      blocks.push({
        kind: "paragraph",
        text: tr("Le Locataire verse au Bailleur, en sus du dépôt de garantie, un droit au bail (pas-de-porte) de {0} à la signature des présentes.", formatXOF(pasDePorte)),
      });
    }
  }

  if (data.type === "PROFESSIONNEL") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — DESTINATION PROFESSIONNELLE" });
    const profession = str(d, "profession") ?? tr("profession à préciser");
    const order = str(d, "professionalOrder");
    blocks.push({
      kind: "paragraph",
      text: tr("Les lieux loués sont destinés exclusivement à l'exercice de la profession de {0}{1}. Toute autre activité est exclue sauf accord écrit du Bailleur.", profession, order ? tr(" (ordre professionnel / agrément n° {0})", order) : ""),
    });
  }

  if (data.type === "TERRAIN") {
    blocks.push({ kind: "heading", text: "ARTICLE 5 — USAGE DU TERRAIN" });
    const landUse = str(d, "landUse") ?? tr("usage à préciser");
    const titleRef = str(d, "titleReference");
    blocks.push({
      kind: "paragraph",
      text: tr("Le terrain loué est destiné à l'usage suivant : {0}.{1}", landUse, titleRef ? tr(" Référence du titre de propriété / ACD / lettre d'attribution : {0}.", titleRef) : ""),
    });
    if (bool(d, "constructionPermitRequired")) {
      blocks.push({
        kind: "paragraph",
        text: tr("Le Locataire s'engage à obtenir toute autorisation de construire nécessaire auprès des autorités compétentes avant d'entreprendre quelque construction que ce soit sur le terrain loué."),
      });
    }
  }
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 7 — OBLIGATIONS DU BAILLEUR" });
  blocks.push({
    kind: "paragraph",
    text: tr("Le Bailleur s'engage à délivrer le bien en bon état d'usage et de réparation, à en assurer la jouissance paisible au Locataire pendant toute la durée du bail, et à effectuer les réparations autres que locatives."),
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: "ARTICLE 8 — OBLIGATIONS DU LOCATAIRE" });
  blocks.push({
    kind: "paragraph",
    text: tr("Le Locataire s'engage à payer le loyer aux termes convenus, à user paisiblement des lieux loués, à les entretenir et à y effectuer les réparations locatives, à ne pas y apporter de modification sans accord écrit du Bailleur, et à restituer le bien en bon état à l'expiration du bail."),
  });
  blocks.push({ kind: "spacer" });

  blocks.push({ kind: "heading", text: tr("ARTICLE 9 — CLAUSE RÉSOLUTOIRE") });
  blocks.push({
    kind: "paragraph",
    text: tr("À défaut de paiement du loyer à son échéance, ou en cas d'inexécution d'une des clauses du présent contrat, et un mois après un commandement de payer ou une mise en demeure restée infructueuse, le présent bail sera résilié de plein droit si bon semble au Bailleur, sans préjudice de tous dommages et intérêts."),
  });

  if (data.specialConditions) {
    blocks.push({ kind: "spacer" });
    blocks.push({ kind: "heading", text: tr("ARTICLE 10 — CONDITIONS PARTICULIÈRES") });
    blocks.push({ kind: "paragraph", text: data.specialConditions });
  }

  blocks.push({ kind: "spacer" });
  blocks.push({
    kind: "paragraph",
    text: tr("Fait à Abidjan, en deux exemplaires originaux, le {0}.", formatDate(new Date())),
  });
  blocks.push({ kind: "spacer" });
  blocks.push({ kind: "signatures", left: tr("Le Bailleur"), right: tr("Le Locataire") });

  return blocks;
}
