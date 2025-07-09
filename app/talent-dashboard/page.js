"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SignInModal from "../../components/SignInModal"; // Assuming your modal component path is correct

export default function Home() {
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState("applications");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setSignInModalOpen(true); // Open the sign-in modal if the user is not logged in
        router.push("/"); // Redirect to home
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
      {/* Sign-In Modal */}
      <SignInModal isOpen={isSignInModalOpen} onClose={() => setSignInModalOpen(false)} />

      {/* Dashboard Content */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 flex-grow">
        {/* Left Panel */}
        <aside className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow space-y-4 h-full">
          <img
            src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.profile_picture_url}`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
          <h2 className="text-center font-bold text-lg mt-2">{profile.full_name}</h2>
          <p className="text-center text-sm text-gray-600 mt-2">{profile.bio}</p>

          {/* Edit Profile Button */}
          <div className="mt-auto">
            <Link href="/edit-profile">
              <button className="w-full bg-[#E8967B] text-white py-2 rounded mt-4 hover:opacity-90">
                Edit Profile
              </button>
            </Link>
          </div>
        </aside>

        {/* Right Panel */}
        <div className="w-full md:w-3/4 space-y-6">
          {/* Tabs */}
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
              onClick={() => setActiveTab("commissions")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === "commissions" ? "bg-white" : "bg-gray-200"}`}
            >
              My Commissions
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === "messages" ? "bg-white" : "bg-gray-200"}`}
            >
              Messages
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 rounded-lg shadow">
            {activeTab === "applications" && <p>You haven't applied to any gigs yet.</p>}
            {activeTab === "tags" && <p>Add tags to help producers find you.</p>}
            {activeTab === "commissions" && <p>You have no active commissions yet.</p>}
            {activeTab === "messages" && <p>No messages yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
