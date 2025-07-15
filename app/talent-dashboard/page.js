"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SignInModal from "../../components/SignInModal";

export default function TalentDashboard() {
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [profile, setProfile] = useState({});
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");
  const router = useRouter();

  // fields considered for completion progress & checklist
  const COMPLETION_FIELDS = [
    "full_name",
    "vanity_username",
    "bio",
    "gender",
    "height",
    "hair_color",
    "sexual_orientation",
    "camera_experience",
    "headshot_image",
    "full_body_image_1",
    "full_body_image_2",
  ];

  const [completionPct, setCompletionPct] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setSignInModalOpen(true);
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile(data);
        calculateCompletion(data);
        fetchApplications(user.id);
      } else {
        console.error("Error loading profile:", error);
      }
    };

    const fetchApplications = async (userId) => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(
          `id, created_at, status, job_postings!inner(id, title, location, pay)`
        )
        .eq("talent_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setApplications(data);
      else console.error("Error fetching applications:", error);
    };

    const calculateCompletion = (data) => {
      const missing = COMPLETION_FIELDS.filter((field) => !data[field]);
      setMissingFields(missing);
      setCompletionPct(
        Math.round(((COMPLETION_FIELDS.length - missing.length) / COMPLETION_FIELDS.length) * 100)
      );
    };

    fetchProfile();
  }, [router]);

  const handleEnableAlerts = () => {
    // TODO: implement notification opt‑in flow
    alert("Alerts enabled! You will now receive notifications about new gigs.");
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setSignInModalOpen(false)}
      />

      <section className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 flex-grow">
        {/* ────── SIDEBAR ────── */}
        <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow space-y-6 h-full">
          {/* Avatar */}
          <Image
            src={
              profile.headshot_image
                ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}`
                : "/placeholder-avatar.png"
            }
            alt="Profile avatar"
            width={128}
            height={128}
            className="rounded-full object-cover mx-auto"
          />
          <h2 className="text-center font-bold text-xl mt-2">{profile.full_name}</h2>
          {profile.vanity_username && (
            <p className="text-center text-sm text-gray-600">
              @{profile.vanity_username}
            </p>
          )}

          {/* Profile progress (styled like ProducerDashboard) */}
          <div>
            <p className="font-semibold mb-1">Profile completeness</p>
            <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-4 bg-blue-600 rounded transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-gray-500">{completionPct}% complete</p>
            {completionPct < 100 && (
              <ul className="text-xs mt-2 list-disc list-inside text-gray-600 space-y-1">
                {missingFields.includes("headshot_image") && <li>Upload head‑shot</li>}
                {missingFields.includes("full_body_image_1") && <li>Full‑body photo 1</li>}
                {missingFields.includes("full_body_image_2") && <li>Full‑body photo 2</li>}
                {missingFields.includes("bio") && <li>Add bio</li>}
                {missingFields.includes("vanity_username") && <li>Set vanity username</li>}
                {missingFields.includes("camera_experience") && <li>Select camera experience</li>}
              </ul>
            )}
          </div>

          {/* Quick meta */}
          <div className="space-y-1 text-sm text-gray-700">
            {profile.updated_at && (
              <p>
                <strong>Last updated:</strong>{" "}
                {new Date(profile.updated_at).toLocaleDateString()}
              </p>
            )}
            <p>
              <strong>Privacy:</strong> {profile.is_public ? "Public" : "Anonymous"}
            </p>
            <p>
              <strong>Profile views:</strong> {profile.profile_views || 0}
            </p>
            <p>
              <strong>Applications submitted:</strong> {applications.length}
            </p>
          </div>

          {/* Callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center text-center space-y-2">
            <p className="text-sm font-medium text-blue-800">
              Turn on notifications to hear about new gigs!
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded"
              onClick={handleEnableAlerts}
            >
              Enable Alerts
            </button>
          </div>

          {/* Edit profile button */}
          <Link href="/edit-profile" className="block">
            <button className="w-full bg-[#E8967B] text-white py-2 rounded hover:opacity-90">
              Edit Profile
            </button>
          </Link>
        </aside>

        {/* ────── MAIN CONTENT ────── */}
        <div className="w-full md:w-3/4 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap space-x-2">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${
                activeTab === "applications" ? "bg-white" : "bg-gray-200"
              }`}
            >
              My Applications
            </button>
            {/* Uncomment if My Tags returns later */}
            {/* <button
              onClick={() => setActiveTab("tags")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${
                activeTab === "tags" ? "bg-white" : "bg-gray-200"
              }`}
            >
              My Tags
            </button> */}
            <button
              onClick={() => setActiveTab("commissions")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${
                activeTab === "commissions" ? "bg-white" : "bg-gray-200"
              }`}
            >
              My Commissions
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${
                activeTab === "messages" ? "bg-white" : "bg-gray-200"
              }`}
            >
              Messages
            </button>
          </div>

          {/* Tab Panels */}
          <div className="bg-white p-6 rounded-lg shadow min-h-[300px]">
            {activeTab === "applications" && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-gray-600">
                    You haven't applied to any gigs yet.
                  </p>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 border rounded shadow-sm hover:bg-gray-50"
                    >
                      <h3 className="font-semibold text-lg">
                        {app.job_postings.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Location: {app.job_postings.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pay: {app.job_postings.pay}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                      </p>
                      <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded mt-2 inline-block">
                        {app.status || "Pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "tags" && (
              <p className="text-gray-700 text-sm">
                Add tags to help producers find you.
              </p>
            )}
            {activeTab === "commissions" && (
              <p className="text-gray-700 text-sm">
                You have no active commissions yet.
              </p>
            )}
            {activeTab === "messages" && (
              <p className="text-gray-700 text-sm">No messages yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
