import type { PublicCompany } from "@/lib/use-company";
import type { Lang, Messages } from "@/lib/i18n";

const fr = {
  unavailable: "Les informations de l'éditeur sont momentanément indisponibles.",
  legalName: "Raison sociale",
  address: "Siège social",
  rccm: "RCCM",
  tax: "Numéro de compte contribuable",
  license: "Agrément d'agent immobilier",
  director: "Directeur de la publication",
  contact: "Contact",
  incomplete: "Certaines informations légales de l'éditeur sont en cours de publication.",
  artci: "Numéro d'autorisation ARTCI",
  artciPending: "Le numéro d'autorisation ARTCI sera publié ici dès sa délivrance.",
  licenseShort: "Agrément",
};
const messages: Messages<typeof fr> = {
  fr,
  en: {
    unavailable: "The publisher's details are temporarily unavailable.",
    legalName: "Company name",
    address: "Registered office",
    rccm: "Trade register (RCCM)",
    tax: "Taxpayer account number",
    license: "Real estate agent licence",
    director: "Publication director",
    contact: "Contact",
    incomplete: "Some of the publisher's legal details are being published.",
    artci: "ARTCI authorisation number",
    artciPending: "The ARTCI authorisation number will be published here as soon as it is issued.",
    licenseShort: "Licence",
  },
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Identité légale de l'agence, lue côté serveur (cache 1 h) : rien à télécharger ni à exécuter dans le navigateur.
 * (Auparavant un composant client qui embarquait axios et React Query sur toutes les pages publiques.)
 */
async function getCompany(): Promise<PublicCompany | null> {
  try {
    const res = await fetch(`${API}/api/settings/public`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

function Line({ label, value, lang }: { label: string; value?: string | null; lang: Lang }) {
  if (!value) return null;
  return (
    <>
      {label}{lang === "fr" ? " : " : ": "}<span className="font-medium text-ink">{value}</span>
      <br />
    </>
  );
}

/** Bloc « Éditeur » des mentions légales : seules les informations renseignées par l'agence sont affichées. */
export async function LegalPublisher({ lang }: { lang: Lang }) {
  const m = messages[lang];
  const c = await getCompany();
  if (!c) return <p className="mt-2 text-ink-muted">{m.unavailable}</p>;
  const complete = c.legalName && c.rccmNumber && c.address && c.publicationDirector;
  return (
    <p className="mt-2 text-ink-muted">
      <Line lang={lang} label={m.legalName} value={c.legalName ?? c.companyName} />
      <Line lang={lang} label={m.address} value={c.address} />
      <Line lang={lang} label={m.rccm} value={c.rccmNumber} />
      <Line lang={lang} label={m.tax} value={c.taxNumber} />
      <Line lang={lang} label={m.license} value={c.agentLicenseNumber} />
      <Line lang={lang} label={m.director} value={c.publicationDirector} />
      <Line lang={lang} label={m.contact} value={[c.phone, c.email].filter(Boolean).join(" · ")} />
      {!complete && <span className="text-xs">{m.incomplete}</span>}
    </p>
  );
}

export async function ArtciDeclaration({ lang }: { lang: Lang }) {
  const m = messages[lang];
  const c = await getCompany();
  return c?.artciNumber ? (
    <>
      {m.artci}{lang === "fr" ? " : " : ": "}<span className="font-medium text-ink">{c.artciNumber}</span>.
    </>
  ) : (
    <>{m.artciPending}</>
  );
}

/** Ligne d'identité sous le pied de page (affichée seulement si des numéros officiels sont renseignés). */
export async function FooterLegalLine({ lang }: { lang: Lang }) {
  const c = await getCompany();
  const parts = [c?.rccmNumber && `RCCM ${c.rccmNumber}`, c?.agentLicenseNumber && `${messages[lang].licenseShort} ${c.agentLicenseNumber}`].filter(Boolean);
  if (!parts.length) return null;
  return <p className="mt-1">{[c?.legalName, ...parts].filter(Boolean).join(" · ")}</p>;
}
