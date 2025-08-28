"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Helper function to get public URL from Supabase storage
const getPublicUrl = (path) => {
  if (!path) return null;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
};

// Skeleton loading component
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white animate-pulse">
    <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-300"></div>
    <div className="max-w-5xl mx-auto px-4 pb-16 pt-16 sm:pt-24">
      <div className="text-center sm:text-left sm:flex sm:items-end sm:justify-between">
        <div>
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-32 mt-6 sm:mt-0"></div>
      </div>
    </div>
  </div>
);

// Social media icon component
const SocialIcon = ({ platform, url, icon, hoverColor }) => {
  if (!url) return null;

  const normalizeSocial = (value, platform) => {
    if (!value) return null;
    const v = value.trim();
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const handle = v.replace(/^@/, '').replace(/^\/+/, '');
    const bases = {
      Instagram: 'https://instagram.com/',
      Twitter:   'https://x.com/',
      Snapchat:  'https://www.snapchat.com/add/',
      TikTok:    'https://www.tiktok.com/@',
      YouTube:   'https://www.youtube.com/@',
    };
    return bases[platform] ? bases[platform] + handle : `https://${handle}`;
  };

  return (
    <a
      href={normalizeSocial(url, platform)}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-2xl transition-all transform hover:scale-110 ${hoverColor}`}
      aria-label={`Visit ${platform} profile`}
    >
      <i className={icon}></i>
    </a>
  );
};

// Gallery component with lazy loading
const GalleryImage = ({ src, alt, onClick }) => (
  <div className="relative aspect-square group cursor-pointer" onClick={onClick}>
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover rounded transition-transform group-hover:scale-105"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded"></div>
  </div>
);

// Enhanced image modal
const ImageModal = ({ image, onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="relative max-w-6xl max-h-full">
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 z-10 transition-colors"
        aria-label="Close image"
      >
        ×
      </button>
      <div className="relative">
        <Image
          src={image}
          alt="Enlarged view"
          width={1200}
          height={800}
          className="max-w-full max-h-[90vh] object-contain rounded"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  </div>
);

// Contact form modal component
const ContactModal = ({ isOpen, onClose, profile }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Here you would implement your contact form logic
    // For now, we'll just simulate a submission
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      alert('Message sent successfully!');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Contact {profile.full_name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded px-3 py-2 h-32"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [viewerId, setViewerId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileViews, setProfileViews] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isNotFound, setIsNotFound] = useState(false);
  const [viewerProfile, setViewerProfile] = useState(null);

  // Set page title
  useEffect(() => {
    if (profile?.full_name) {
      document.title = `${profile.full_name} - FanGigs`;
    }
  }, [profile?.full_name]);

  // Track profile view
  useEffect(() => {
    if (profile?.id && viewerId && viewerId !== profile.id) {
      (async () => {
        await supabase.rpc('increment_profile_views', { profile_id: profile.id });
        setProfileViews(prev => prev + 1);
      })();
    }
  }, [profile?.id, viewerId]);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setViewerId(user?.id || null);

        if (user?.id) {
          // Fetch viewer's profile to check their type
          const { data: viewerData } = await supabase
            .from("profiles")
            .select("type")
            .eq("id", user.id)
            .single();
          setViewerProfile(viewerData);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("vanity_username", username)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setIsNotFound(true);
            setLoading(false);
            return;
          }
          throw error;
        }

        setProfile(data);
        setProfileViews(data.profile_views || 0);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, retryCount]);

  useEffect(() => {
    if (!profile || profile.type !== "producer") return;

    (async () => {
      try {
        const { data } = await supabase
          .from("job_postings")
          .select("id,slug,title,location,pay,tags,created_at,status,is_active")
          .eq("creator_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(6);
        setJobs(data || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    })();
  }, [profile]);

  useEffect(() => {
    if (!viewerId || !profile?.id || viewerId === profile.id) return;

    (async () => {
      try {
        const { data: existing } = await supabase
          .from("saved_profiles")
          .select("id")
          .eq("producer_id", viewerId)
          .eq("saved_profile_id", profile.id)
          .single();

        setIsSaved(!!existing);
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    })();
  }, [viewerId, profile]);

  // Helper to calculate profile completeness (example, can be expanded)
  const getProfileCompleteness = () => {
    if (!profile) return 0;
    let completeness = 0;
    if (profile.full_name) completeness += 10;
    if (profile.bio) completeness += 20;
    if (profile.headshot_image) completeness += 20;
    if (profile.gender) completeness += 5;
    if (profile.height) completeness += 5;
    if (profile.birthday) completeness += 5;
    if (profile.location) completeness += 5;
    if (profile.instagram_handle || profile.twitter_handle || profile.snapchat_handle) completeness += 10;
    if (profile.cover_image) completeness += 10;
    if (profile.galleryImages && profile.galleryImages.length > 0) completeness += 10;
    return Math.min(completeness, 100);
  };

  const handleSaveToggle = async () => {
    if (!viewerId || !profile?.id) return;

    try {
      if (isSaved) {
        await supabase
          .from("saved_profiles")
          .delete()
          .eq("producer_id", viewerId)
          .eq("saved_profile_id", profile.id);
        setIsSaved(false);
      } else {
        await supabase.from("saved_profiles").insert([
          {
            producer_id: viewerId,
            saved_profile_id: profile.id,
          },
        ]);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name} - FanGigs Profile`,
          text: `Check out ${profile.full_name}'s profile on FanGigs`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const calcAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getLastActive = (updatedAt) => {
    if (!updatedAt) return 'Unknown';
    const date = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getDaysActive = (updatedAt) => {
    if (!updatedAt) return 0;
    const date = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded shadow max-w-sm">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <button
            onClick={retry}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isNotFound || (!loading && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded shadow max-w-sm">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">This profile doesn't exist or has been removed.</p>
          <Link href="/find-talent" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Browse Talent
          </Link>
        </div>
      </div>
    );
  }

  if (!profile.is_public && viewerId !== profile.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded shadow max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Private Profile</h2>
          <p className="text-gray-600">This user keeps their profile private.</p>
        </div>
      </div>
    );
  }

  const galleryImages = [
    profile.full_body_image_1 && { src: getPublicUrl(profile.full_body_image_1), alt: "Photo 1" },
    profile.full_body_image_2 && { src: getPublicUrl(profile.full_body_image_2), alt: "Photo 2" },
    profile.full_body_image_3 && { src: getPublicUrl(profile.full_body_image_3), alt: "Photo 3" },
    profile.full_body_image_4 && { src: getPublicUrl(profile.full_body_image_4), alt: "Photo 4" },
    profile.full_body_image_5 && { src: getPublicUrl(profile.full_body_image_5), alt: "Photo 5" },
  ].filter(Boolean);

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">


        {/* Cover Section with optimized image */}
        <header className="relative h-56 sm:h-64 md:h-72 lg:h-80">
          <Image
            src={
              profile.cover_image
                ? profile.cover_image.startsWith("default")
                  ? `/images/covers/${profile.cover_image}`
                  : getPublicUrl(profile.cover_image)
                : "/images/covers/default1.jpg"
            }
            alt="Cover"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Profile picture with better positioning */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 sm:left-20 sm:translate-x-0">
            <div className="relative">
              <Image
                src={
                  profile.headshot_image
                    ? getPublicUrl(profile.headshot_image)
                    : "/placeholder-avatar.png"
                }
                alt={profile.full_name}
                width={192}
                height={192}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-white object-cover shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => profile.headshot_image && setModalImage(getPublicUrl(profile.headshot_image))}
              />
              {profile.is_verified && (
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2">
                  <i className="fas fa-check text-sm"></i>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 pb-16 pt-12">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center sm:text-left sm:flex sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {profile.full_name}
                  </h1>
                  {profile.is_verified && (
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                  )}
                  <button
                    onClick={handleShareProfile}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                    aria-label="Share profile"
                  >
                    <i className="fas fa-share-alt text-lg"></i>
                  </button>
                </div>

                <p className="text-gray-600 mb-3 font-medium">@{profile.vanity_username}</p>

                {/* Stats Row - Different for Talent vs Producer */}
                {profile.type === "talent" ? (
                  <div className="flex justify-center sm:justify-start gap-6 mb-4">
                    <div className="text-center">
                      <div className="font-bold text-xl text-gray-900">0</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Saved by Producers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-gray-900">{getProfileCompleteness()}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Profile Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-gray-900">
                        {new Date(profile.created_at).getFullYear()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Member Since</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center sm:justify-start gap-6 mb-4">
                    <Link href="/producer-dashboard?tab=job-posts" className="text-center hover:opacity-80 transition-opacity">
                      <div className="font-bold text-xl text-blue-600">{jobs.filter(job => job.status === 'approved' && job.is_active).length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Open Gigs Now</div>
                    </Link>
                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="font-bold text-xl text-gray-900">0</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Upcoming Trips</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-gray-900">{profileViews}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Profile Views</div>
                    </div>
                  </div>
                )}

                {/* Enhanced tags with modern styling */}
                <div className="flex justify-center sm:justify-start flex-wrap gap-2 mb-4">
                  {profile.gender && (
                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {profile.gender}
                    </span>
                  )}
                  {profile.height && (
                    <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {profile.height} cm
                    </span>
                  )}
                  {profile.birthday && (
                    <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {calcAge(profile.birthday)} years
                    </span>
                  )}
                  {profile.sexual_orientation && (
                    <span className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                      {profile.sexual_orientation}
                    </span>
                  )}
                  {profile.location && (
                    <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      📍 {profile.location}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-4 mt-6">
                  {viewerId && viewerId !== profile.id && profile.type !== "producer" && viewerProfile?.type === "creator" && (
                    <button
                      onClick={handleSaveToggle}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 ${
                        isSaved
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                          : "bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50"
                      }`}
                    >
                      {isSaved ? "★ Saved" : "♡ Save Talent"}
                    </button>
                  )}
                  {viewerId === profile.id && (
                    <Link href="/edit-profile">
                      <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 hover:shadow-lg">
                        ✏️ Edit Profile
                      </button>
                    </Link>
                  )}
                </div>
              </div>

            {/* Social media section with enhanced styling */}
            <div className="flex justify-center sm:justify-start gap-3 mt-4">
              <SocialIcon
                platform="Instagram"
                url={profile.instagram_handle}
                icon="fa-brands fa-instagram"
                hoverColor="hover:text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-all"
              />
              <SocialIcon
                platform="Twitter"
                url={profile.twitter_handle}
                icon="fa-brands fa-x-twitter"
                hoverColor="hover:text-black hover:bg-gray-100 p-2 rounded-full transition-all"
              />
              <SocialIcon
                platform="Snapchat"
                url={profile.snapchat_handle}
                icon="fa-brands fa-snapchat"
                hoverColor="hover:text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-all"
              />
            </div>
          </div>

          {viewerId && viewerId !== profile.id && (
                    <button
                      onClick={() => setIsContactModalOpen(true)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
                    >
                      {profile.type === "producer" ? "Contact Producer" : "Request Collab"}
                    </button>
                  )}
          </div>

          {/* About section */}
          <section className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <i className="fas fa-user text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line leading-relaxed text-gray-700">
                  {profile.bio || "✨ This user hasn't written a bio yet."}
                </p>
              </div>
            </div>
          </section>

          {/* Enhanced gallery section */}
          {profile.type !== "producer" && galleryImages.length > 0 && (
            <section className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-lg">
                    <i className="fas fa-images text-white"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {galleryImages.length} photos
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <GalleryImage
                        src={image.src}
                        alt={image.alt}
                        onClick={() => setModalImage(image.src)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Producer jobs section */}
          {profile.type === "producer" && (
            <section className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
                    <i className="fas fa-briefcase text-white"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Gigs</h2>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {jobs.length} posted
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-briefcase text-4xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-500 font-medium">This producer hasn't posted any gigs yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {jobs.map((job) => (
                      <Link key={job.id} href={`/job/${job.slug}`}>
                        <div className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <i className="fas fa-map-marker-alt text-red-500"></i>
                                  <span>{job.location || "Remote"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <i className="fas fa-dollar-sign text-green-500"></i>
                                  <span>{job.pay ? `$${job.pay}` : "Negotiable"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <i className="fas fa-calendar text-blue-500"></i>
                                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              {job.tags && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {job.tags.slice(0, 4).map((tag) => (
                                    <span key={tag} className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full px-3 py-1 text-xs font-semibold">
                                      #{tag}
                                    </span>
                                  ))}
                                  {job.tags.length > 4 && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                      +{job.tags.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                              <i className="fas fa-arrow-right text-gray-600 group-hover:text-blue-600 transition-colors"></i>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Enhanced Image Modal */}
        {modalImage && (
          <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
        )}

        {/* Contact Modal */}
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          profile={profile}
        />
      </div>
    </>
  );
}