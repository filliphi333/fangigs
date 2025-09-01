// app/sitemap.js
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function fetchApprovedJobs() {
  const { data, error } = await supabase
    .from("job_postings")
    .select("id, description, updated_at")
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(5000);
  if (error) return [];
  return data || [];
}

async function fetchPublicProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("vanity_username, last_seen")
    .eq("is_public", true) // ⬅️ change if your column is named differently
    .not("vanity_username", "is", null)
    .limit(5000);
  if (error) return [];
  return data || [];
}

export const dynamic = "force-dynamic";
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    "", "/find-work", "/find-talent", "/about", "/privacy", "/terms",
  ].map((p) => ({
    url: absoluteUrl(p),
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1.0 : 0.7,
  }));

  const jobs = (await fetchApprovedJobs()).map((j) => ({
    url: absoluteUrl(`/jobs/${j.id}`),
    lastModified: j.updated_at || now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const profiles = (await fetchPublicProfiles()).map((p) => ({
    url: absoluteUrl(`/profile/${p.vanity_username}`),
    lastModified: p.updated_at || now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...jobs, ...profiles];
}
