'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function JobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sessionUser, setSessionUser] = useState(null);       // auth user
  const [userType, setUserType]   = useState("");             // talent | creator
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  /* ────────────────────────── fetch job + profile + session ────────────────────────── */
  useEffect(() => {
    (async () => {
      /* 1️⃣  Auth */
      const { data: { user }} = await supabase.auth.getUser();
      setSessionUser(user || null);

      /* 2️⃣  Job by slug */
      const { data: jobData, error: jobErr } = await supabase
        .from("job_postings")
        .select("*")
        .eq("id", id)
        .single();

      if (jobErr || !jobData) { setLoading(false); return; }
      setJob(jobData);

      /* 3️⃣  Producer profile username */
      if (jobData.creator_id) {
        const { data: producerData } = await supabase
          .from("profiles")
          .select("vanity_username")
          .eq("id", jobData.creator_id)
          .single();
        if (producerData) setProducer(producerData);
      }

      /* 4️⃣  Current user’s type & existing application? */
      if (user) {
        const { data: myProf } = await supabase
          .from("profiles")
          .select("type")
          .eq("id", user.id)
          .single();

        if (myProf?.type) setUserType(myProf.type);

        const { data: appRow } = await supabase
          .from("job_applications")
          .select("id")
          .eq("job_id", jobData.id)
          .eq("talent_id", user.id)
          .maybeSingle();               // returns null if none

        if (appRow) setAlreadyApplied(true);
      }

      setLoading(false);
    })();
  }, [id]);

  /* ─────────────────────────────── apply handler ─────────────────────────────── */
  const handleApply = async () => {
    if (!sessionUser) {
      alert("You must be logged in to apply.");
      router.push("/sign-in");
      return;
    }
    if (alreadyApplied) {
      alert("You have already applied to this gig.");
      return;
    }

    const { error } = await supabase.from("job_applications").insert({
      job_id: job.id,
      talent_id: sessionUser.id
    });

    if (error) {
      alert("Error applying.");
      console.error(error);
    } else {
      setAlreadyApplied(true);
      alert("Application sent!");
    }
  };

  /* ──────────────────────────── UI ──────────────────────────── */

  if (loading)       return <p className="p-6">Loading…</p>;
  if (!job)          return <p className="p-6 text-red-500">Job not found.</p>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* title & producer */}
      <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
      {producer && (
        <p className="text-blue-600 underline mb-4">
          <Link href={`/profile/${producer.vanity_username}`} target="_blank" rel="noopener noreferrer">
            {producer.vanity_username}
          </Link>
        </p>
      )}

      {/* quick facts */}
      <div className="mb-4 text-gray-700 space-y-1">
        {job.location && <p><strong>Location:</strong> {job.location}</p>}
        <p><strong>Pay:</strong> {job.pay || "Confidential"}</p>
      </div>

      {/* description */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">About the Project</h2>
        <p className="whitespace-pre-line">{job.description}</p>
      </div>

      {/* tags */}
      {job.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.map((tag, i) => (
            <span key={i} className="bg-pink-200 text-pink-800 px-2 py-1 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        Expires: {job.expiration ? new Date(job.expiration).toLocaleDateString() : "N/A"}
      </p>

      {/* apply button */}
      {userType === "talent" && (
        alreadyApplied ? (
          <span className="inline-block bg-green-600 text-white px-4 py-2 rounded">
            ✅ Applied
          </span>
        ) : (
          <button
            onClick={handleApply}
            className="bg-[#E8967B] text-white px-6 py-2 rounded hover:opacity-90"
          >
            Apply to This Gig
          </button>
        )
      )}
    </main>
  );
}
