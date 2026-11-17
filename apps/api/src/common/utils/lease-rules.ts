import { LeaseType } from "@prisma/client";

export const MAX_DEPOSIT_MONTHS = 2;
export const MAX_ADVANCE_MONTHS = 2;
const HABITATION_TYPES: LeaseType[] = [LeaseType.HABITATION_NUE, LeaseType.HABITATION_MEUBLEE];

/**
 * Code de la construction et de l'habitat (loi n° 2019-576 du 26 juin 2019) : pour un bail d'habitation,
 * caution et avance sont plafonnées à 2 mois de loyer chacune. Les baux commerciaux/professionnels relèvent de l'OHADA.
 * Renvoie le message d'erreur, ou null si le bail est conforme.
 */
export function entryCostViolation(type: LeaseType, rent: number, deposit: number, advance: number): string | null {
  if (!HABITATION_TYPES.includes(type) || rent <= 0) return null;
  const problems: string[] = [];
  if (deposit > rent * MAX_DEPOSIT_MONTHS) problems.push(`la caution dépasse ${MAX_DEPOSIT_MONTHS} mois de loyer`);
  if (advance > rent * MAX_ADVANCE_MONTHS) problems.push(`l'avance dépasse ${MAX_ADVANCE_MONTHS} mois de loyer`);
  if (!problems.length) return null;
  return `Bail d'habitation non conforme : ${problems.join(" et ")} (loi n° 2019-576, maximum ${MAX_DEPOSIT_MONTHS} mois chacune).`;
}
