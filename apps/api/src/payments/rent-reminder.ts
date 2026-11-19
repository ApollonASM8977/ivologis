/** P1-16 : règles de date des impayés et des relances automatiques (pures, testées dans test/unit.test.js). */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Relance automatique 5 jours après l'échéance (le 1er du mois, ou la date d'entrée si le bail commence ce mois-ci). */
export const RENT_REMINDER_DELAY_DAYS = 5;

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthsBetween(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
}

/**
 * L'avance versée à l'entrée (loi 2019-576 : au plus 2 mois) paie les premiers mois du bail :
 * aucun loyer n'est dû pour ces mois-là, ils ne sont donc ni impayés ni relancés.
 */
export function coveredByAdvance(lease: { startDate: Date; rentAmount: unknown; advance: unknown }, month: Date) {
  const rent = Number(lease.rentAmount);
  const prepaidMonths = rent > 0 ? Math.floor(Number(lease.advance) / rent) : 0;
  return monthsBetween(startOfMonth(lease.startDate), startOfMonth(month)) < prepaidMonths;
}

/** Vrai quand le loyer du mois en cours est échu depuis au moins RENT_REMINDER_DELAY_DAYS jours. */
export function reminderDue(startDate: Date, now: Date) {
  const monthStart = startOfMonth(now);
  const due = startDate > monthStart ? startDate : monthStart;
  return now.getTime() - due.getTime() >= RENT_REMINDER_DELAY_DAYS * DAY_MS;
}
