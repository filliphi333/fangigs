import { supabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/seo";
import ProfilePageClient from "./ProfilePageClient";

// Server component for metadata generation
export async function generateMetadata({ params }) {
  const { username } = await params;

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, bio, type, vanity_username, headshot_image")
      .eq("vanity_username", username)
      .single();

    if (error || !profile) {
      return {
        title: "Profile Not Found - FanGigs",
        description: "This profile doesn't exist or has been removed.",
      };
    }

    const ogImageUrl = absoluteUrl(`/api/og/profile?name=${encodeURIComponent(profile.full_name || '')}&username=${encodeURIComponent(profile.vanity_username || '')}&type=${encodeURIComponent(profile.type || '')}&bio=${encodeURIComponent(profile.bio?.substring(0, 100) || '')}`);

    return {
      title: `${profile.full_name} (@${profile.vanity_username}) - FanGigs`,
      description: profile.bio?.substring(0, 160) || `Check out ${profile.full_name}'s profile on FanGigs. Connect with talented ${profile.type}s in the adult entertainment industry.`,
      keywords: `${profile.full_name}, ${profile.vanity_username}, ${profile.type}, adult content creator, FanGigs`,
      openGraph: {
        title: `${profile.full_name} (@${profile.vanity_username})`,
        description: profile.bio?.substring(0, 160) || `Check out ${profile.full_name}'s profile on FanGigs`,
        type: 'profile',
        url: absoluteUrl(`/profile/${username}`),
        siteName: 'FanGigs',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${profile.full_name} - FanGigs Profile`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${profile.full_name} (@${profile.vanity_username})`,
        description: profile.bio?.substring(0, 160) || `Check out ${profile.full_name}'s profile on FanGigs`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Profile - FanGigs",
      description: "Discover amazing talent on FanGigs.",
    };
  }
}

// Server component that renders the client component
export default async function ProfilePage({ params }) {
  const { username } = await params;
  return <ProfilePageClient username={username} />;
}