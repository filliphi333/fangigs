"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';

/* ─────────────────────── ApplicationsList COMPONENT ─────────────────────── */
function ApplicationsList({ jobIds }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("job_applications")
      .select(`
  id,
  created_at,
  job_id,
  job_postings (
    id,
    title
  ),
  profiles:talent_id (
    id,
    full_name,
    headshot_image
  )
`)
.in("job_id", jobIds

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data);
      }

      setLoading(false);
    };

    if (jobIds.length > 0) fetchApplications();
    else setLoading(false);
  }, [jobIds]);

  if (loading) return <p>Loading applications...</p>;
  if (applications.length === 0) return <p>No applications received yet.</p>;

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="border p-4 rounded shadow-sm flex items-center gap-4 hover:bg-blue-50 transition"
        >
          <img
            src={
              app.profiles?.profile_picture_url
                ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${app.profiles.profile_picture_url}`
                : "/placeholder-avatar.png"
            }
            alt="applicant"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold">{app.profiles?.full_name || "Unknown"}</p>
            <p className="text-sm text-gray-600">Applied to: {app.job_postings?.title}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(app.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProducerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("job-posts");
  const [jobPosts, setJobPosts] = useState([]); // ← Add this lin
  const router = useRouter();

const handleDelete = async (jobId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this job?");
  if (!confirmDelete) return;

  const { error } = await supabase
    .from("job_postings")
    .delete()
    .eq("id", jobId);

  if (error) {
    alert("Failed to delete job.");
    console.error("Delete error:", error);
  } else {
    setJobPosts((prev) => prev.filter((j) => j.id !== jobId));
    alert("Job deleted.");
  }
};

useEffect(() => {
  const fetchProfile = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      router.push("/sign-in");
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !data || data.type !== "creator") {
      router.push("/edit-profile");
      return;
    }

    setProfile(data);

    const { data: jobs, error: jobsError } = await supabase
  .from("job_postings")
  .select("*")
  .eq("creator_id", user.id)
  .order("created_at", { ascending: false });

console.log("User ID:", user.id);
console.log("Jobs:", jobs);
console.log("Jobs Error:", jobsError);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
    } else {
      setJobPosts(jobs);
    }

    setLoading(false);
  };

  fetchProfile();
}, [router]);

  if (loading) return <p>Loading dashboard...</p>;

  const renderTab = () => {
    switch (activeTab) {
case "job-posts":
  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      {jobPosts.length === 0 ? (
        <p>No job posts yet.</p>
      ) : (
        jobPosts.map((job) => (
          <div key={job.id} className="border p-4 rounded shadow-sm hover:bg-blue-50 transition">
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.location}</p>
            <p className="mt-1">{job.description?.slice(0, 100)}...</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(job.tags) && job.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => router.push(`/edit-job/${job.id}`)}
                className="text-sm px-3 py-1 bg-yellow-300 text-yellow-900 rounded hover:bg-yellow-400"
              >
                Edit
              </button>
             <button
             onClick={() => handleDelete(job.id)}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
             Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );  

        case "applications":
  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      {jobPosts.length === 0 ? (
        <p>You haven't posted any jobs yet.</p>
      ) : (
        <ApplicationsList jobIds={jobPosts.map(job => job.id)} />
      )}
    </div>
  );    
     
        case "saved-talents":
        return <div className="bg-white p-4 rounded shadow">Saved talents.</div>;
      case "messages":
        return <div className="bg-white p-4 rounded shadow">Message inbox here.</div>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#CDDFF3]">

      <div className="max-w-7xl mx-auto p-4 flex">
       {/* Left Panel */}
{/* ───────────────── Left panel ───────────────── */}
<aside className="w-1/4 p-4 bg-white rounded shadow space-y-6">

  {/* Avatar */}
  <img
    src={
      profile.profile_picture_url
        ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.profile_picture_url}`
        : "/placeholder-avatar.png"
    }
    alt="profile"
    className="w-32 h-32 rounded-full mx-auto object-cover"
  />

  {/* Name & bio */}
  <div className="text-center">
    <h2 className="text-xl font-semibold">{profile.full_name}</h2>
    {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
  </div>

  {/* Profile-completion */}
  {(() => {
    const checks = [
      profile.headshot_image,
      profile.cover_image,
      profile.bio,
      profile.full_body_image_1,
      profile.full_body_image_2,
      profile.vanity_username,
      profile.camera_experience,
    ];
    const done = checks.filter(Boolean).length;
    const pct = Math.round((done / checks.length) * 100);
    return (
      <div>
        <p className="font-semibold mb-1">Profile completeness</p>
        <div className="w-full h-3 bg-gray-200 rounded">
          <div
            className="h-3 bg-blue-600 rounded"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs mt-1 text-gray-500">{pct}% complete</p>
        {pct < 100 && (
          <ul className="text-xs mt-2 list-disc list-inside text-gray-600 space-y-1">
            {!profile.headshot_image && <li>Upload head-shot</li>}
            {!profile.cover_image && <li>Add cover image</li>}
            {!profile.bio && <li>Add bio</li>}
            {!profile.full_body_image_1 && <li>Full-body photo 1</li>}
            {!profile.full_body_image_2 && <li>Full-body photo 2</li>}
            {!profile.vanity_username && <li>Set vanity username</li>}
            {!profile.camera_experience && <li>Select camera experience</li>}
          </ul>
        )}
      </div>
    );
  })()}

  {/* Stats */}
  <div className="space-y-1">
    <p className="font-semibold">Your stats</p>
    <p className="text-sm text-gray-700">🎬 Jobs posted: <span className="font-medium">{jobPosts.length}</span></p>
    <p className="text-sm text-gray-700">👀 Views on jobs: <span className="font-medium">—</span></p>
    <p className="text-sm text-gray-700">📩 Applications: <span className="font-medium">—</span></p>
  </div>

  {/* Edit profile */}
  <Link href="/edit-profile">
    <button className="w-full bg-blue-700 text-white font-semibold py-2 rounded hover:bg-blue-800 transition">
      Edit Profile
    </button>
  </Link>
</aside>

        {/* Main Panel */}
        <section className="flex-1 ml-6">
          <div className="flex space-x-4 mb-4">
            <button onClick={() => setActiveTab("job-posts")} className={`font-bold py-2 px-4 rounded ${activeTab === "job-posts" ? "bg-white" : "bg-blue-100"}`}>My Job Posts</button>
            <button onClick={() => setActiveTab("applications")} className={`font-bold py-2 px-4 rounded ${activeTab === "applications" ? "bg-white" : "bg-blue-100"}`}>Applications</button>
            <button onClick={() => setActiveTab("saved-talents")} className={`font-bold py-2 px-4 rounded ${activeTab === "saved-talents" ? "bg-white" : "bg-blue-100"}`}>Saved Talents</button>
            <button onClick={() => setActiveTab("messages")} className={`font-bold py-2 px-4 rounded ${activeTab === "messages" ? "bg-white" : "bg-blue-100"}`}>Messages</button>
          </div>
          {renderTab()}
        </section>
      </div>
    </main>
  );
}
