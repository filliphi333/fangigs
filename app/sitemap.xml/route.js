
// app/sitemap.xml/route.js
import { NextResponse } from "next/server";

// Avoid pre-render at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://fangigs.replit.app";

  // Base routes (always present)
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: 1.0 },
    { loc: `${SITE_URL}/find-work`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${SITE_URL}/find-talent`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${SITE_URL}/post-job`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: 0.4 },
    { loc: `${SITE_URL}/terms`, changefreq: 'yearly', priority: 0.4 },
    { loc: `${SITE_URL}/faq`, changefreq: 'monthly', priority: 0.5 },
  ];

  // Optional: include dynamic items if envs are present (won't run if missing)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      // import on-demand so build doesn't choke if package is missing
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      // Approved jobs
      const { data: jobs } = await supabase
        .from("job_postings")
        .select("id, slug, updated_at, status")
        .eq("status", "approved")
        .eq("is_active", true)
        .limit(500);

      jobs?.forEach((j) => {
        const path = j.slug ? `/job/${j.slug}` : `/job/${j.id}`;
        urls.push({
          loc: `${SITE_URL}${path}`,
          changefreq: "daily",
          priority: 0.8,
          lastmod: j.updated_at || new Date().toISOString(),
        });
      });

      // Public profiles
      const { data: profs } = await supabase
        .from("profiles")
        .select("username, is_public, updated_at")
        .eq("is_public", true)
        .not("username", "is", null)
        .limit(500);

      profs?.forEach((p) => {
        if (p.username) {
          urls.push({
            loc: `${SITE_URL}/profile/${encodeURIComponent(p.username)}`,
            changefreq: "weekly",
            priority: 0.6,
            lastmod: p.updated_at || new Date().toISOString(),
          });
        }
      });
    } catch {
      // swallow errors → still return base sitemap
    }
  }

  const now = new Date().toISOString();
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        return [
          `<url>`,
          `<loc>${u.loc}</loc>`,
          `<lastmod>${u.lastmod || now}</lastmod>`,
          u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "",
          u.priority != null ? `<priority>${u.priority}</priority>` : "",
          `</url>`,
        ].join("");
      })
      .join("\n") +
    `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
