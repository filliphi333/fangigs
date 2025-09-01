// app/robots.js
import { siteUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/talent-dashboard",
        "/producer-dashboard",
        "/admin",
        "/api/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
