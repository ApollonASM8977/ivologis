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
