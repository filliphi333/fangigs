"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SignInModal from "../../components/SignInModal";
import MessagesInbox from "../../components/MessagesInbox";

export default function TalentDashboard() {
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [profile, setProfile] = useState({});
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 20;

  const totalPages = Math.ceil(applications.length / applicationsPerPage);
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = applications.slice(indexOfFirstApp, indexOfLastApp);

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
      setLoading(false);
    };

    const fetchApplications = async (userId) => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          created_at,
          status,
          job_postings:job_id (
            id,
            title,
            location,
            pay
          )
        `)
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Please log in to upload images");
      }

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File too large. Please choose an image under 5MB.");
      }

      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file.");
      }

      const extension = file.name.split(".").pop();
      const path = `${user.id}/headshot_image.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ headshot_image: path })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      // Update local profile state
      setProfile(prev => ({ ...prev, headshot_image: path }));
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successMsg.textContent = 'Profile image updated successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorMsg.textContent = error.message;
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEnableAlerts = () => {
    // TODO: implement notification opt‑in flow
    alert("Alerts enabled! You will now receive notifications about new gigs.");
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setSignInModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Image with Upload */}
            <div className="relative">
              <Image
                src={
                  profile.headshot_image
                    ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}?t=${Date.now()}`
                    : "/placeholder-avatar.png"
                }
                alt="Profile avatar"
                width={120}
                height={120}
                className="rounded-full object-cover border-4 border-gray-200 shadow-lg"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute -bottom-2 -right-2 text-white rounded-full p-2 cursor-pointer transition-colors ${
                  uploadingImage 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <i className="fas fa-camera text-sm"></i>
                )}
              </label>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
              {profile.vanity_username && (
                <p className="text-lg text-gray-600 mb-4">@{profile.vanity_username}</p>
              )}
              
              {/* Quick Stats */}
              <div className="flex justify-center lg:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="font-bold text-2xl text-blue-600">{applications.length}</div>
                  <div className="text-sm text-gray-500">Applications</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-green-600">{completionPct}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-600">
                    {applications.filter(app => app.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-500">Approved</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/edit-profile">
                  <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                  </button>
                </Link>
                <Link href={`/profile/${profile.vanity_username}`}>
                  <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg">
                    <i className="fas fa-eye mr-2"></i>
                    View Public Profile
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          {completionPct < 100 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-orange-800">Complete Your Profile</h3>
                <span className="text-sm font-medium text-orange-600">{completionPct}%</span>
              </div>
              <div className="w-full h-3 bg-orange-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {missingFields.includes("headshot_image") && <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">Upload headshot</span>}
                {missingFields.includes("full_body_image_1") && <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">Full-body photo 1</span>}
                {missingFields.includes("full_body_image_2") && <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">Full-body photo 2</span>}
                {missingFields.includes("bio") && <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">Add bio</span>}
                {missingFields.includes("vanity_username") && <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">Set username</span>}
                {missingFields.includes("camera_experience") && <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">Camera experience</span>}
              </div>
            </div>
          )}
        </div>

        {/* Notification Alert */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-lg mb-1">Never Miss a Gig!</h3>
              <p className="text-blue-100">Enable notifications to get alerts about new opportunities</p>
            </div>
            <button
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap"
              onClick={handleEnableAlerts}
            >
              <i className="fas fa-bell mr-2"></i>
              Enable Alerts
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex-1 min-w-0 px-6 py-4 font-semibold text-center transition-all ${
                activeTab === "applications" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <i className="fas fa-file-alt mr-2"></i>
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("commissions")}
              className={`flex-1 min-w-0 px-6 py-4 font-semibold text-center transition-all ${
                activeTab === "commissions" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <i className="fas fa-handshake mr-2"></i>
              Commissions
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 min-w-0 px-6 py-4 font-semibold text-center transition-all ${
                activeTab === "messages" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <i className="fas fa-envelope mr-2"></i>
              Messages
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[400px]">
            {activeTab === "applications" && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Yet</h3>
                    <p className="text-gray-500 mb-6">Start applying to gigs to see them here!</p>
                    <Link href="/find-work">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                        Browse Available Gigs
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {currentApplications.map((app) => (
                      <Link key={app.id} href={`/job/${app.job_postings.id}`} className="block">
                        <div className="p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-blue-600 hover:text-blue-700">
                              {app.job_postings.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              app.status === 'approved' ? 'bg-green-100 text-green-700' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {app.status || "Pending"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <span><i className="fas fa-map-marker-alt mr-1"></i>{app.job_postings.location}</span>
                            <span><i className="fas fa-dollar-sign mr-1"></i>{app.job_postings.pay}</span>
                            <span><i className="fas fa-calendar mr-1"></i>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg border ${
                              currentPage === page 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "commissions" && (
              <div className="text-center py-12">
                <i className="fas fa-handshake text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Commissions</h3>
                <p className="text-gray-500">Custom work opportunities will appear here when available.</p>
              </div>
            )}

            {activeTab === "messages" && (
              <MessagesInbox userId={profile.id} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}