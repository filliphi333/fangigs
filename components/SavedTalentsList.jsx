"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function SavedTalentsList({ producerId }) {
  const [savedTalents, setSavedTalents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedTalents = async () => {
      const { data, error } = await supabase
        .from("saved_profiles")
        .select("saved_profile_id, profiles:saved_profile_id (id, full_name, headshot_image, vanity_username)")
        .eq("producer_id", producerId);

      if (error) {
        console.error("Error fetching saved talents:", error);
      } else {
        setSavedTalents(data);
      }

      setLoading(false);
    };

    if (producerId) fetchSavedTalents();
  }, [producerId]);

  if (loading) return <p>Loading saved talents...</p>;
  if (savedTalents.length === 0) return <p>No saved talents yet.</p>;

  return (
    <div className="space-y-4">
      {savedTalents.map((item) => (
        <div key={item.saved_profile_id} className="flex items-center gap-4 border p-4 rounded shadow-sm">
          <img
            src={
              item.profiles?.headshot_image
                ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${item.profiles.headshot_image}`
                : "/placeholder-avatar.png"
            }
            alt="headshot"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{item.profiles?.full_name || "Unnamed Talent"}</p>
            <Link
              href={`/profile/${item.profiles?.vanity_username}`}
              className="text-sm text-blue-600 underline"
            >
              View Profile
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
