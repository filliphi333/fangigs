"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

const bucketURL =
  "https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile]       = useState(null);
  const [jobs,    setJobs]          = useState([]);
  const [viewerId,setViewerId]      = useState(null);

  /* ── Fetch current viewer (to know if they’re owner) ── */
  useEffect(() => {
    (async () => {
      const { data:{user} } = await supabase.auth.getUser();
      setViewerId(user?.id || null);
    })();
  }, []);

  /* ── Fetch profile by vanity_username ── */
  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("vanity_username", username)
        .single();
      if (!error) setProfile(data);
    })();
  }, [username]);

  /* ── If producer, fetch their jobs ── */
  useEffect(() => {
    if (!profile || profile.type !== "producer") return;
    (async () => {
      const { data } = await supabase
        .from("job_postings")
        .select("id,title,location,pay,tags")
        .eq("producer_id", profile.id)
        .order("created_at",{ascending:false})
        .limit(6);
      setJobs(data || []);
    })();
  }, [profile]);

  /* ── Helpers ── */
  const calcAge = (birthday) => {
    if (!birthday) return null;
    const b = new Date(birthday);
    const diff = Date.now() - b;
    return Math.floor(diff / 3.15576e10); // ms to years
  };

  if (!profile) return <p className="p-6">Loading…</p>;

  /* ── Gate for anonymous profiles ── */
  if (!profile.is_public && viewerId !== profile.id)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-center bg-white p-8 rounded shadow max-w-sm">
          This user keeps their profile private.
        </p>
      </div>
    );

  /* ───────── MARKUP ───────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Cover */}
      <header className="relative h-56 sm:h-64 md:h-72 lg:h-80">
        <img
          src={
  profile.cover_image
    ? profile.cover_image.startsWith("default")
      ? `/images/covers/${profile.cover_image}`
      : `${bucketURL}/${profile.cover_image}`
    : "/images/covers/default1.jpg"
}
          alt="Cover"
          className="object-cover object-center w-full h-full"
        />
        {/* Avatar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 sm:left-20 sm:translate-x-0">
          <img
            src={
              profile.headshot_image
                ? `${bucketURL}/${profile.headshot_image}`
                : "/placeholder-avatar.png"
            }
            alt={profile.full_name}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-white object-cover shadow-lg"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 pb-16 pt-16 sm:pt-24">
        {/* Name + socials row */}
        <div className="text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              {profile.full_name}
            </h1>
            <p className="text-gray-500">@{profile.vanity_username}</p>
            <div className="mt-2 flex justify-center sm:justify-start flex-wrap gap-2 text-sm">
              {profile.gender && (
                <span className="bg-gray-200 px-2 py-0.5 rounded">
                  {profile.gender}
                </span>
              )}
              {profile.height && (
                <span className="bg-gray-200 px-2 py-0.5 rounded">
                  {profile.height} cm
                </span>
              )}
              {profile.birthday && (
                <span className="bg-gray-200 px-2 py-0.5 rounded">
                  {calcAge(profile.birthday)} yrs
                </span>
              )}
              {profile.sexual_orientation && (
                <span className="bg-gray-200 px-2 py-0.5 rounded">
                  {profile.sexual_orientation}
                </span>
              )}
            </div>
          </div>

          {/* Contact / Collaborate button */}
          <a
            href={`mailto:${profile.contact_email || ""}`}
            className="inline-block mt-6 sm:mt-0 bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700"
          >
            {profile.type === "producer" ? "Contact Producer" : "Request Collab"}
          </a>
        </div>

        {/* Social icons */}
<div className="mt-4 flex justify-center sm:justify-start gap-4 text-gray-500">
  {profile.instagram_handle && (
    <a href={profile.instagram_handle} target="_blank" rel="noopener noreferrer">
      <i className="fa-brands fa-instagram text-2xl hover:text-pink-500"></i>
    </a>
  )}
  {profile.twitter_handle && (
    <a href={profile.twitter_handle} target="_blank" rel="noopener noreferrer">
      <i className="fa-brands fa-x-twitter text-2xl hover:text-black"></i>
    </a>
  )}
  {profile.snapchat_handle && (
    <a href={profile.snapchat_handle} target="_blank" rel="noopener noreferrer">
      <i className="fa-brands fa-snapchat text-2xl hover:text-yellow-500"></i>
    </a>
  )}
</div>

        {/* About */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-2">About Me</h2>
          <p className="whitespace-pre-line leading-relaxed">
            {profile.bio || "No bio yet."}
          </p>
        </section>

        {/* Gallery (talent) */}
        {profile.type !== "producer" && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.headshot_image && (
                <img
  src={profile.headshot_image ? `${bucketURL}/${profile.headshot_image}` : "/placeholder-avatar.png"}
  alt="Headshot"
  className="aspect-square object-cover rounded cursor-pointer hover:opacity-90"
/>
              )}
              {profile.full_body_image_1 && (
                <img
                  src={`${bucketURL}/${profile.full_body_image_1}`}
                  alt="Full body 1"
                  className="aspect-square object-cover rounded cursor-pointer hover:opacity-90"
                />
              )}
              {profile.full_body_image_2 && (
                <img
                  src={`${bucketURL}/${profile.full_body_image_2}`}
                  alt="Full body 2"
                  className="aspect-square object-cover rounded cursor-pointer hover:opacity-90"
                />
              )}
            </div>
          </section>
        )}

        {/* Jobs (producer) */}
        {profile.type === "producer" && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Posted Gigs</h2>
            {jobs.length === 0 ? (
              <p>This producer hasn’t posted any gigs yet.</p>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="border rounded p-4 hover:shadow cursor-pointer bg-white"
                  >
                    <Link href={`/jobs/${job.id}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <span className="text-sm text-gray-500">
                          {job.location || "Remote"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {job.pay
                          ? `$${job.pay}`
                          : "Pay confidential / to be negotiated"}
                      </p>
                      {job.tags && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {job.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-rose-100 text-rose-600 rounded px-2 py-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
