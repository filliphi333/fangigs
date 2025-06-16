"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TalentDashboard() {
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState("applications");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) console.error("Error loading profile:", error);
      else setProfile(data);
    };

    fetchProfile();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#CDDFF3] flex flex-col">

      {/* Dashboard Content */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 flex-grow">
        {/* Left Panel */}
        <aside className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow space-y-4">
          <img
            src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.profile_picture_url}`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
          <h2 className="text-center font-bold text-lg">{profile.full_name}</h2>
          <p className="text-center text-sm text-gray-600">{profile.bio}</p>
          <div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase mt-4 mb-2">Connect</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {profile.twitter_handle && (
                <li><a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank">@{profile.twitter_handle}</a></li>
              )}
              {profile.instagram_handle && (
                <li><a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank">@{profile.instagram_handle}</a></li>
              )}
              {profile.snapchat_handle && (
                <li><a href={`https://snapchat.com/add/${profile.snapchat_handle}`} target="_blank">@{profile.snapchat_handle}</a></li>
              )}
            </ul>
          </div>
        </aside>

        {/* Right Panel */}
        <div className="w-full md:w-3/4 space-y-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === "applications" ? "bg-white" : "bg-gray-200"}`}
            >
              My Applications
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === "tags" ? "bg-white" : "bg-gray-200"}`}
            >
              My Tags
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === "messages" ? "bg-white" : "bg-gray-200"}`}
            >
              Messages
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            {activeTab === "applications" && <p>You haven't applied to any gigs yet.</p>}
            {activeTab === "tags" && <p>Add tags to help producers find you.</p>}
            {activeTab === "messages" && <p>No messages yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
