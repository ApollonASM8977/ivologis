/**
 * Transition entre les pages : rejouée à chaque navigation (un template est recréé à chaque changement de page).
 * En CSS et en mouvement seul : l'ancienne version (opacité 0 + flou, en JavaScript) rendait TOUTES les pages
 * invisibles jusqu'au chargement du JavaScript, soit plusieurs secondes en 3G (LCP à 4-5 s).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="ivo-page">{children}</div>;
}
