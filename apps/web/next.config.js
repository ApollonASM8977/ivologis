/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ivologis/shared"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
