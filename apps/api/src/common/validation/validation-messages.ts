import { BadRequestException, ValidationError } from "@nestjs/common";

/** Noms lisibles des champs les plus courants, pour des messages compréhensibles par un utilisateur non technique. */
const FIELD_LABELS: Record<string, string> = {
  amount: "Le montant",
  rentAmount: "Le loyer",
  deposit: "La caution",
  advance: "L'avance",
  startDate: "La date de début",
  endDate: "La date de fin",
  periodMonth: "Le mois concerné",
  paymentDate: "La date de paiement",
  method: "Le moyen de paiement",
  type: "Le type",
  status: "Le statut",
  phone: "Le téléphone",
  email: "L'adresse e-mail",
  fullName: "Le nom complet",
  name: "Le nom",
  address: "L'adresse",
  commune: "La commune",
  description: "La description",
  message: "Le message",
  password: "Le mot de passe",
  newPassword: "Le nouveau mot de passe",
  propertyId: "Le bien",
  tenantId: "Le locataire",
  ownerId: "Le propriétaire",
  leaseId: "Le contrat",
  checkIn: "La date d'arrivée",
  checkOut: "La date de départ",
  identifier: "L'identifiant",
};

function label(property: string) {
  return FIELD_LABELS[property] ?? `Le champ « ${property} »`;
}

const DEFAULT_ENGLISH = /\b(must|should)\b/;

/** Traduit un message par défaut de class-validator ; garde tel quel un message déjà rédigé dans le DTO. */
export function frenchConstraintMessage(property: string, constraint: string, original: string): string {
  if (!DEFAULT_ENGLISH.test(original)) return original;
  const l = label(property);
  switch (constraint) {
    case "whitelistValidation":
      return `Champ non autorisé : ${property}.`;
    case "isNotEmpty":
    case "isDefined":
      return `${l} est obligatoire.`;
    case "isEnum":
    case "isIn":
      return `${l} : valeur non reconnue.`;
    case "isEmail":
      return "Adresse e-mail invalide.";
    case "isUUID":
      return `${l} : identifiant invalide.`;
    case "isDateString":
    case "isDate":
    case "isISO8601":
      return `${l} : date invalide.`;
    case "isNumber":
    case "isInt":
    case "isPositive":
      return `${l} doit être un nombre valide.`;
    case "min":
      return `${l} est trop petit.`;
    case "max":
      return `${l} est trop grand.`;
    case "minLength":
      return `${l} est trop court.`;
    case "maxLength":
      return `${l} est trop long.`;
    case "isString":
      return `${l} doit être un texte.`;
    case "isBoolean":
      return `${l} : oui ou non attendu.`;
    case "isArray":
      return `${l} doit être une liste.`;
    case "arrayMaxSize":
      return `${l} : trop d'éléments.`;
    default:
      return `${l} : valeur invalide.`;
  }
}

/** Messages d'un champ : un champ absent donne un seul « est obligatoire » au lieu de plusieurs contraintes. */
export function messagesFor(error: ValidationError): string[] {
  const constraints = Object.entries(error.constraints ?? {});
  if (!constraints.length) return [];
  const missing = error.value === undefined || error.value === null || error.value === "";
  if (missing && !error.constraints?.whitelistValidation) return [`${label(error.property)} est obligatoire.`];
  return constraints.map(([constraint, message]) => frenchConstraintMessage(error.property, constraint, message));
}

function collect(errors: ValidationError[], out: string[]) {
  for (const error of errors) {
    out.push(...messagesFor(error));
    if (error.children?.length) collect(error.children, out);
  }
  return out;
}

/** `exceptionFactory` du ValidationPipe global : messages en français, même forme qu'avant (tableau `message`). */
export function frenchValidationException(errors: ValidationError[]) {
  return new BadRequestException(Array.from(new Set(collect(errors, []))));
}
