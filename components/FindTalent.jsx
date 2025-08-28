'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_SIZE = 20;

const TAG_OPTIONS = [
  'Model', 'Photographer', 'Cameraman', 'Editor',
  'Makeup Artist', 'BDSM Friendly', 'Feet', 'Trans'
];

export default function FindTalent() {
  const [models, setModels] = useState([]);
  const [gender, setGender] = useState('');
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 100 });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [savedTalents, setSavedTalents] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Get current user for save functionality
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Load saved talents
        const { data } = await supabase
          .from('saved_profiles')
          .select('saved_profile_id')
          .eq('producer_id', user.id);
        
        if (data) {
          setSavedTalents(new Set(data.map(item => item.saved_profile_id)));
        }
      }
    };
    getCurrentUser();
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleSaveTalent = async (talentId) => {
    if (!currentUser) {
      showNotification('Please sign in to save talents', 'error');
      return;
    }

    try {
      if (savedTalents.has(talentId)) {
        // Remove from saved
        await supabase
          .from('saved_profiles')
          .delete()
          .eq('producer_id', currentUser.id)
          .eq('saved_profile_id', talentId);
        
        setSavedTalents(prev => {
          const newSet = new Set(prev);
          newSet.delete(talentId);
          return newSet;
        });
        showNotification('Talent removed from saved', 'success');
      } else {
        // Add to saved
        await supabase
          .from('saved_profiles')
          .insert({
            producer_id: currentUser.id,
            saved_profile_id: talentId
          });
        
        setSavedTalents(prev => new Set([...prev, talentId]));
        showNotification('Talent saved successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving talent:', error);
      showNotification('Error saving talent', 'error');
    }
  };

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setGender('');
    setSearch('');
    setTags([]);
    setAgeRange({ min: 18, max: 100 });
    setPage(1);
  };

  const fetchModels = async () => {
    setLoading(true);

    try {
      let baseQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .eq('type', 'talent');

      if (gender) baseQuery = baseQuery.eq('gender', gender);
      if (search.trim()) {
        baseQuery = baseQuery.or(`full_name.ilike.%${search.trim()}%,sexual_orientation.ilike.%${search.trim()}%,bio.ilike.%${search.trim()}%`);
      }
      if (tags.length) baseQuery = baseQuery.contains('tags', tags);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await baseQuery.range(from, to);
      
      if (error) {
        console.error('Error fetching talents:', error);
        showNotification('Error loading talents', 'error');
        return;
      }

      let filtered = data || [];
      if (ageRange.min && ageRange.max) {
        filtered = filtered.filter(model =>
          model.age === null ||
          (model.age >= ageRange.min && model.age <= ageRange.max)
        );
      }

      filtered.sort((a, b) => {
        if (a.age === null) return 1;
        if (b.age === null) return -1;
        return a.age - b.age;
      });

      setModels(filtered);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching talents:', error);
      showNotification('Error loading talents', 'error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [page]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 rounded-2xl aspect-square mb-3"></div>
          <div className="bg-gray-300 h-4 rounded mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  if (initialLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="animate-pulse space-y-6">
                <div className="bg-gray-300 h-6 rounded w-1/2"></div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-300 h-4 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content skeleton */}
          <div className="flex-1">
            <div className="animate-pulse mb-8">
              <div className="bg-gray-300 h-8 rounded w-1/3 mb-4"></div>
              <div className="bg-gray-300 h-4 rounded w-1/2"></div>
            </div>
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg transition-all ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fas ${
              notification.type === 'success' ? 'fa-check-circle' :
              notification.type === 'error' ? 'fa-exclamation-circle' :
              'fa-info-circle'
            }`}></i>
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ───────── Sidebar Filters ───────── */}
          <aside className="w-full lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              {/* Mobile filter toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-between"
                >
                  <span>
                    <i className="fas fa-filter mr-2"></i>
                    Filters
                  </span>
                  <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
                </button>
              </div>

              <div className={`space-y-6 ${showFilters || 'hidden lg:block'}`}>
                {/* Results summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {totalCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Talents Found
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-search mr-2"></i>
                    Search Talents
                  </label>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Name, orientation, bio..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <i className="fas fa-venus-mars mr-2"></i>
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'non-binary'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setGender(gender === opt ? '' : opt)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          gender === opt 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {opt === 'male' ? '♂️ Male' : opt === 'female' ? '♀️ Female' : '⚧️ Non-binary'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    Age Range
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={ageRange.min}
                      onChange={(e) => setAgeRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min"
                    />
                    <span className="text-gray-500 font-medium">to</span>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={ageRange.max}
                      onChange={(e) => setAgeRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <i className="fas fa-tags mr-2"></i>
                    Categories
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {TAG_OPTIONS.map(tag => (
                      <label key={tag} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={tags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                        />
                        <div className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          tags.includes(tag)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md'
                            : 'bg-gray-50 text-gray-700 border-gray-200 group-hover:border-purple-300'
                        }`}>
                          <span className="text-sm font-medium">{tag}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setPage(1);
                      fetchModels();
                    }}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </span>
                    ) : (
                      <span>
                        <i className="fas fa-search mr-2"></i>
                        Apply Filters
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={clearAllFilters}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    <i className="fas fa-undo mr-2"></i>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ───────── Main Content ───────── */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
                Discover Amazing Talent
              </h1>
              <p className="text-lg text-gray-600">
                Browse verified creators, models, and performers ready for your next project
              </p>
            </div>

            {/* Results */}
            {loading ? (
              <LoadingSkeleton />
            ) : models.length > 0 ? (
              <>
                {/* Talent Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
                  {models.map(model => (
                    <div key={model.id} className="group relative">
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        {/* Save button */}
                        {currentUser && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSaveTalent(model.id);
                            }}
                            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              savedTalents.has(model.id)
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <i className={`fas fa-heart text-sm`}></i>
                          </button>
                        )}

                        <Link href={`/profile/${model.vanity_username}`} className="block">
                          {/* Profile Image */}
                          <div className="aspect-square relative overflow-hidden">
                            <Image
                              src={model.headshot_image
                                ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${model.headshot_image}`
                                : '/placeholder-avatar.png'}
                              alt={model.full_name || 'Talent'}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                            />
                            
                            {/* Overlay with quick info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                                {model.age && (
                                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 inline-block mb-1">
                                    {model.age} years old
                                  </div>
                                )}
                                {model.tags && model.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {model.tags.slice(0, 2).map((tag, i) => (
                                      <span key={i} className="bg-purple-500/80 rounded px-1 py-0.5 text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                    {model.tags.length > 2 && (
                                      <span className="bg-gray-500/80 rounded px-1 py-0.5 text-xs">
                                        +{model.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Profile Info */}
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                              {model.full_name || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              @{model.vanity_username}
                            </p>
                            
                            {/* Quick stats */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              {model.gender && (
                                <span className="capitalize">
                                  {model.gender === 'male' ? '♂️' : model.gender === 'female' ? '♀️' : '⚧️'} {model.gender}
                                </span>
                              )}
                              {model.height && (
                                <span>{model.height}"</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ───────── Pagination ───────── */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <i className="fas fa-chevron-left mr-1"></i>
                      Previous
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next button */}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <i className="fas fa-chevron-right ml-1"></i>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-search text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No talents found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms to find more results.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <i className="fas fa-undo mr-2"></i>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}