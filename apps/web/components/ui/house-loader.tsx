/**
 * Chargement « maison qui se construit » : sol tracé, fondation, murs qui montent, toit en terre cuite qui se pose,
 * cheminée, porte, fenêtres qui s'allument, fumée… puis la maison s'efface et se reconstruit (boucle de 3,6 s).
 * SVG + CSS uniquement (classes `ivo-house-*` de globals.css) : aucun JavaScript, fluide même en 3G.
 */
export function HouseLoader({ label = "Chargement en cours", hint, size = 96 }: { label?: string; hint?: string; size?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <svg viewBox="0 0 120 100" width={size} height={(size * 100) / 120} aria-hidden="true" className="ivo-house overflow-visible">
        <line className="ivo-house-ground" x1="8" y1="88" x2="112" y2="88" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" pathLength={1} />
        <rect className="ivo-house-base" x="26" y="84" width="68" height="4" rx="1" fill="#94A3B8" />
        <rect className="ivo-house-walls" x="30" y="50" width="60" height="34" rx="2" fill="#FFFFFF" stroke="#0B5FFF" strokeWidth="2.5" />
        <path className="ivo-house-roof" d="M22 53 L60 21 L98 53 Z" fill="#C2672B" stroke="#A85520" strokeWidth="1.5" strokeLinejoin="round" />
        <rect className="ivo-house-chimney" x="77" y="26" width="7" height="15" rx="1" fill="#A85520" />
        <rect className="ivo-house-door" x="54" y="64" width="12" height="20" rx="6" fill="#0B5FFF" />
        <rect className="ivo-house-window" x="37" y="59" width="10" height="10" rx="1.5" fill="#FCD34D" />
        <rect className="ivo-house-window ivo-house-window-2" x="73" y="59" width="10" height="10" rx="1.5" fill="#FCD34D" />
        <circle className="ivo-house-smoke" cx="80.5" cy="20" r="3" fill="#CBD5E1" />
        <circle className="ivo-house-smoke ivo-house-smoke-2" cx="83" cy="14" r="2.2" fill="#E2E8F0" />
      </svg>
      <p className="text-sm font-medium text-ink">{label}…</p>
      {hint && <p className="max-w-xs text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
