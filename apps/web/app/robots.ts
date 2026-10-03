import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/securite", "/mentions-legales", "/confidentialite"], disallow: ["/admin", "/owner", "/tenant", "/api"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
