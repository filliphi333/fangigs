"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FindWork() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    roleType: "",
    category: "",
    payRange: ""
  });
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const jobsPerPage = 6;
  const router = useRouter();

  // Trending tags data
  const trendingTags = [
    { name: "Collab", icon: "fas fa-handshake", color: "from-blue-500 to-purple-600" },
    { name: "Remote", icon: "fas fa-home", color: "from-green-500 to-teal-600" },
    { name: "Studio", icon: "fas fa-video", color: "from-red-500 to-pink-600" },
    { name: "New Creator", icon: "fas fa-star", color: "from-yellow-500 to-orange-600" },
    { name: "Professional", icon: "fas fa-briefcase", color: "from-indigo-500 to-blue-600" },
    { name: "Content Creator", icon: "fas fa-camera", color: "from-purple-500 to-pink-600" },
    { name: "Model", icon: "fas fa-user", color: "from-pink-500 to-red-600" },
    { name: "Editor", icon: "fas fa-cut", color: "from-teal-500 to-green-600" }
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          profiles:creator_id(
            id,
            full_name,
            vanity_username,
            headshot_image
          )
        `)
        .eq("is_active", true)
        .or(`expiration.is.null,expiration.gte.${today}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Role type filter
    if (filters.roleType) {
      filtered = filtered.filter(job =>
        job.role_type === filters.roleType ||
        job.tags?.includes(filters.roleType)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(job =>
        job.category === filters.category ||
        job.tags?.includes(filters.category)
      );
    }

    // Pay range filter
    if (filters.payRange) {
      filtered = filtered.filter(job => {
        const pay = parseFloat(job.pay) || 0;
        switch (filters.payRange) {
          case "0-500": return pay <= 500;
          case "500-1000": return pay > 500 && pay <= 1000;
          case "1000-2500": return pay > 1000 && pay <= 2500;
          case "2500+": return pay > 2500;
          default: return true;
        }
      });
    }

    return filtered;
  }, [jobs, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const saveJob = async (jobId) => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: user.id, job_id: jobId });
        setSavedJobs(prev => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      roleType: "",
      category: "",
      payRange: ""
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleTagClick = (tagName) => {
    setSearchTerm(tagName);
    setCurrentPage(1);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-14"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-8"></div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Next <span className="text-yellow-300">Opportunity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover exciting gigs and collaborate with top creators in the industry
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search jobs, locations, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 text-gray-900 text-lg placeholder-gray-500 shadow-xl focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Tags */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-fire text-orange-500"></i>
              Trending Now
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {trendingTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag.name)}
                className={`px-4 py-2 rounded-full text-white font-medium text-sm transition-all transform hover:scale-105 hover:shadow-lg bg-gradient-to-r ${tag.color}`}
              >
                <i className={`${tag.icon} mr-2`}></i>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + Results */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm font-medium"
            >
              <i className="fas fa-filter text-blue-600"></i>
              Filters
              <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} text-sm`}></i>
            </button>

            {(Object.values(filters).some(f => f) || searchTerm) && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <i className="fas fa-times"></i>
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading...
                </div>
              ) : (
                `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`
              )}
            </span>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Type</label>
                <select
                  value={filters.roleType}
                  onChange={(e) => setFilters({...filters, roleType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="Talent">Talent</option>
                  <option value="Content Creator">Content Creator</option>
                  <option value="Studio">Studio</option>
                  <option value="Cameraman">Cameraman</option>
                  <option value="Editor">Editor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Solo">Solo</option>
                  <option value="Boy/Girl">Boy/Girl</option>
                  <option value="Group">Group</option>
                  <option value="LGBT+">LGBT+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Range</label>
                <select
                  value={filters.payRange}
                  onChange={(e) => setFilters({...filters, payRange: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Budget</option>
                  <option value="0-500">$0 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500+">$2,500+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          ) : paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group">
                {/* Job Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {job.profiles?.full_name?.charAt(0) || job.title?.charAt(0) || 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 font-medium truncate">
                      @{job.profiles?.vanity_username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">{getTimeAgo(job.created_at)}</p>
                  </div>
                  <button
                    onClick={() => saveJob(job.id)}
                    className={`p-2 rounded-full transition-colors ${
                      savedJobs.has(job.id) 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                    }`}
                  >
                    <i className={`fas fa-heart text-sm`}></i>
                  </button>
                </div>

                {/* Job Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>

                {/* Job Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Job Meta */}
                <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                  <div className="flex items-center gap-1 text-gray-600">
                    <i className="fas fa-map-marker-alt text-red-500"></i>
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <i className="fas fa-dollar-sign text-green-500"></i>
                    <span>{job.pay ? `$${job.pay}` : "Negotiable"}</span>
                  </div>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href={`/job/${job.slug}`} className="flex-1">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] hover:shadow-lg">
                      <i className="fas fa-eye mr-2"></i>
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
              <button
                onClick={resetFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}