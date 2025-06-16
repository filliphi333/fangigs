"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProducerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("job-posts");
  const router = useRouter();

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

      if (profileError || !data || data.type !== "producer") {
        router.push("/edit-profile");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;

  const renderTab = () => {
    switch (activeTab) {
      case "job-posts":
        return <div className="bg-white p-4 rounded shadow">Job posts will go here.</div>;
      case "applications":
        return <div className="bg-white p-4 rounded shadow">Applications received.</div>;
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
        <aside className="w-1/4 p-4 bg-white rounded shadow space-y-4">
          <img
            src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.profile_picture_url}`}
            alt="profile"
            className="w-32 h-32 rounded-full mx-auto object-cover"
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold">{profile.full_name}</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
          <div>
            <p className="font-bold text-sm mb-1">CONNECT</p>
            <div className="flex flex-col text-blue-800">
              {profile.twitter_handle && <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank">@{profile.twitter_handle}</a>}
              {profile.instagram_handle && <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank">@{profile.instagram_handle}</a>}
              {profile.snapchat_handle && <a href={`https://snapchat.com/add/${profile.snapchat_handle}`} target="_blank">@{profile.snapchat_handle}</a>}
            </div>
          </div>
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
