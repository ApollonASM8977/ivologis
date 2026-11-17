import type { PublicCompany } from "@/lib/use-company";

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

function Line({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <>
      {label} : <span className="font-medium text-ink">{value}</span>
      <br />
    </>
  );
}

/** Bloc « Éditeur » des mentions légales : seules les informations renseignées par l'agence sont affichées. */
export async function LegalPublisher() {
  const c = await getCompany();
  if (!c) return <p className="mt-2 text-ink-muted">Les informations de l&apos;éditeur sont momentanément indisponibles.</p>;
  const complete = c.legalName && c.rccmNumber && c.address && c.publicationDirector;
  return (
    <p className="mt-2 text-ink-muted">
      <Line label="Raison sociale" value={c.legalName ?? c.companyName} />
      <Line label="Siège social" value={c.address} />
      <Line label="RCCM" value={c.rccmNumber} />
      <Line label="Numéro de compte contribuable" value={c.taxNumber} />
      <Line label="Agrément d'agent immobilier" value={c.agentLicenseNumber} />
      <Line label="Directeur de la publication" value={c.publicationDirector} />
      <Line label="Contact" value={[c.phone, c.email].filter(Boolean).join(" · ")} />
      {!complete && <span className="text-xs">Certaines informations légales de l&apos;éditeur sont en cours de publication.</span>}
    </p>
  );
}

export async function ArtciDeclaration() {
  const c = await getCompany();
  return c?.artciNumber ? (
    <>
      Numéro d&apos;autorisation ARTCI : <span className="font-medium text-ink">{c.artciNumber}</span>.
    </>
  ) : (
    <>Le numéro d&apos;autorisation ARTCI sera publié ici dès sa délivrance.</>
  );
}

/** Ligne d'identité sous le pied de page (affichée seulement si des numéros officiels sont renseignés). */
export async function FooterLegalLine() {
  const c = await getCompany();
  const parts = [c?.rccmNumber && `RCCM ${c.rccmNumber}`, c?.agentLicenseNumber && `Agrément ${c.agentLicenseNumber}`].filter(Boolean);
  if (!parts.length) return null;
  return <p className="mt-1">{[c?.legalName, ...parts].filter(Boolean).join(" · ")}</p>;
}
