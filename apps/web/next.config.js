/** @type {import('next').NextConfig} */

const apiHost = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").hostname;

const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").origin;

// Politique de sécurité du contenu (OWASP A02/A05) : le navigateur refuse tout script, image, appel réseau ou cadre
// venant d'un autre domaine que le site, l'API et les cartes. Limite le vol de session en cas de faille XSS.
// shortcut: 'unsafe-inline' pour les scripts (Next.js insère ses données en ligne) ; passer à un nonce si les pages
// deviennent dynamiques. En développement, Next.js a besoin d'eval : pas de CSP stricte hors production.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin} https://images.unsplash.com`,
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}`,
  // Carte OpenStreetMap et visites virtuelles 360° (lien https saisi par l'agence uniquement).
  "frame-src https:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Seulement si l'API est en https (sinon les essais locaux en http seraient bloqués).
  apiOrigin.startsWith("https:") && "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: process.env.NODE_ENV === "production" ? csp : "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), geolocation=(self)" },
];

const nextConfig = {
  transpilePackages: ["@ivologis/shared"],
  // Ne pas annoncer la technologie du site (X-Powered-By: Next.js).
  poweredByHeader: false,
  // Métadonnées (titre, description, Open Graph) toujours dans <head>, pour tous les visiteurs et robots :
  // sinon Next 15 les diffuse en différé dans <body> sur les pages dynamiques (catalogue, fiches) et le SEO les perd.
  htmlLimitedBots: /.*/,
  images: {
    // Liste fermée : sinon l'optimiseur d'images sert de proxy gratuit vers n'importe quel site.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: apiHost },
      // shortcut: photos des annonces de démonstration uniquement ; retirer avec les données de démo.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
