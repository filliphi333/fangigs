// lib/seo.js
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fan-gigs.com";

export const absoluteUrl = (path = "") =>
  path?.startsWith("http") ? path : `${siteUrl}${path}`;
