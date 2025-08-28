"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MessagesInbox from "../../components/MessagesInbox";
import SavedTalentsList from "../../components/SavedTalentsList";

/* ─────────────────────── ApplicationsList COMPONENT ─────────────────────── */
function ApplicationsList({ jobs }) {
  const [jobApplications, setJobApplications] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationsForJobs = async () => {
      if (jobs.length === 0) {
        setLoading(false);
        return;
      }

      const jobIds = jobs.map(job => job.id);
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          created_at,
          job_id,
          profiles:talent_id (
            id,
            full_name,
            headshot_image,
            vanity_username
          )
        `)
        .in("job_id", jobIds);

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        // Group applications by job_id
        const grouped = {};
        data.forEach(app => {
          if (!grouped[app.job_id]) {
            grouped[app.job_id] = [];
          }
          grouped[app.job_id].push(app);
        });
        setJobApplications(grouped);
      }

      setLoading(false);
    };

    fetchApplicationsForJobs();
  }, [jobs]);

  const toggleJobExpansion = (jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const totalApplications = Object.values(jobApplications).reduce((total, apps) => total + apps.length, 0);

  if (totalApplications === 0) return (
    <div className="text-center py-12">
      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-user-clock text-4xl text-gray-400"></i>
      </div>
      <p className="text-gray-500 font-medium">No applications received yet.</p>
      <p className="text-gray-400 text-sm mt-1">Your posted gigs will attract talent applications here!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const applications = jobApplications[job.id] || [];
        const isExpanded = expandedJobs[job.id];
        
        return (
          <div key={job.id} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
            {/* Job Header - Clickable */}
            <div 
              onClick={() => toggleJobExpansion(job.id)}
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-map-marker-alt text-red-500"></i>
                      <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-dollar-sign text-green-500"></i>
                      <span>{job.pay ? `$${job.pay}` : "Negotiable"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-calendar text-blue-500"></i>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full px-4 py-2 font-bold text-lg">
                      {applications.length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {applications.length === 1 ? 'Application' : 'Applications'}
                    </p>
                  </div>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <i className="fas fa-chevron-down text-gray-400 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications List - Expandable */}
            {isExpanded && applications.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Applications for this gig:</h4>
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Image
                              src={
                                app.profiles?.headshot_image
                                  ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${app.profiles.headshot_image}`
                                  : "/placeholder-avatar.png"
                              }
                              alt="Applicant"
                              width={48}
                              height={48}
                              className="rounded-full object-cover border-2 border-gray-200"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-gray-900">
                                {app.profiles?.full_name || "Unknown"}
                              </h5>
                              {app.profiles?.vanity_username && (
                                <Link 
                                  href={`/profile/${app.profiles.vanity_username}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  target="_blank"
                                >
                                  @{app.profiles.vanity_username}
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <i className="fas fa-calendar text-blue-500"></i>
                                <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <i className="fas fa-clock text-green-500"></i>
                                <span>{new Date(app.created_at).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.profiles?.vanity_username && (
                              <Link 
                                href={`/profile/${app.profiles.vanity_username}`}
                                target="_blank"
                              >
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                                  <i className="fas fa-eye mr-1"></i>View Profile
                                </button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── ProducerDashboard ─────────────────────── */
export default function ProducerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [jobPosts, setJobPosts] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
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

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
      } else {
        setJobPosts(jobs);
      }

      const { data: apps, error: appsError } = await supabase
        .from("job_applications")
        .select("id")
        .in("job_id", jobs.map((j) => j.id));

      if (!appsError) {
        setApplicationCount(apps.length);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Gigs</p>
                    <p className="text-3xl font-bold text-gray-900">{jobPosts.filter(job => job.is_active).length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <i className="fas fa-briefcase text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{applicationCount}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <i className="fas fa-user-check text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900">{jobPosts.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {jobPosts.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <i className="fas fa-briefcase text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "job-posts":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
                  <i className="fas fa-briefcase text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">My Job Posts</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {jobPosts.length} total
                </span>
              </div>
              <Link href="/post-job">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 hover:shadow-lg">
                  <i className="fas fa-plus mr-2"></i>Post New Gig
                </button>
              </Link>
            </div>
            
            {jobPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-briefcase text-4xl text-gray-400"></i>
                </div>
                <p className="text-gray-500 font-medium mb-2">No job posts yet.</p>
                <p className="text-gray-400 text-sm mb-6">Start by posting your first gig to find talent!</p>
                <Link href="/post-job">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
                    Post Your First Gig
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobPosts.map((job) => (
                  <div key={job.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
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
                        <p className="text-gray-600 mb-3">{job.description?.slice(0, 150)}...</p>
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                                #{tag}
                              </span>
                            ))}
                            {job.tags.length > 3 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                +{job.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/edit-job/${job.id}`)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-yellow-600 transition-colors"
                        >
                          <i className="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          <i className="fas fa-trash mr-1"></i>Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "applications":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <i className="fas fa-user-check text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Applications by Job</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {applicationCount} total
              </span>
            </div>
            {jobPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-briefcase text-4xl text-gray-400"></i>
                </div>
                <p className="text-gray-500 font-medium mb-2">You haven't posted any jobs yet.</p>
                <p className="text-gray-400 text-sm">Post a gig to start receiving applications!</p>
              </div>
            ) : (
              <ApplicationsList jobs={jobPosts} />
            )}
          </div>
        );

      case "saved-talents":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-lg">
                <i className="fas fa-heart text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Saved Talents</h2>
            </div>
            <SavedTalentsList producerId={profile.id} />
          </div>
        );

      case "messages":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                <i className="fas fa-envelope text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            </div>
            <MessagesInbox userId={profile.id} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src={
                  profile.headshot_image
                    ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}`
                    : "/placeholder-avatar.png"
                }
                alt="Profile"
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {profile.full_name}
              </h1>
              <p className="text-gray-600 font-medium mb-4">Producer Dashboard</p>
              {profile.bio && (
                <p className="text-gray-600 text-sm max-w-2xl">{profile.bio}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/profile/${profile.vanity_username}`}>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 hover:shadow-lg">
                  <i className="fas fa-eye mr-2"></i>View Profile
                </button>
              </Link>
              <Link href="/post-job">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium text-sm transition-all transform hover:scale-105 hover:shadow-lg">
                  <i className="fas fa-plus mr-2"></i>Post New Gig
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Overview", icon: "fas fa-home" },
              { id: "job-posts", label: "My Gigs", icon: "fas fa-briefcase" },
              { id: "applications", label: "Applications", icon: "fas fa-user-check" },
              { id: "saved-talents", label: "Saved Talents", icon: "fas fa-heart" },
              { id: "messages", label: "Messages", icon: "fas fa-envelope" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}