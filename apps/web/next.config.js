/** @type {import('next').NextConfig} */

const apiHost = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").hostname;

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), geolocation=(self)" },
];

const nextConfig = {
  transpilePackages: ["@ivologis/shared"],
  // Métadonnées (titre, description, Open Graph) toujours dans <head>, pour tous les visiteurs et robots :
  // sinon Next 15 les diffuse en différé dans <body> sur les pages dynamiques (catalogue, fiches) et le SEO les perd.
  htmlLimitedBots: /.*/,
  experimental: {
    // CSS intégré à la page : l'affichage n'attend plus un fichier CSS séparé, il a lieu avant l'exécution du JavaScript.
    inlineCss: true,
  },
  images: {
    // AVIF d'abord (~30 % plus léger que WebP), WebP pour les navigateurs plus anciens.
    formats: ["image/avif", "image/webp"],
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
