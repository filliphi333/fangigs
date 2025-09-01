
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PopupManager from '../../components/AdminPopupManager';

// Loading Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-8 rounded mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 mb-4">
        <div className="bg-gray-200 h-6 rounded flex-1"></div>
        <div className="bg-gray-200 h-6 rounded w-24"></div>
        <div className="bg-gray-200 h-6 rounded w-20"></div>
      </div>
    ))}
  </div>
);

// Error Boundary Component
const ErrorBoundary = ({ error, retry, children }) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={retry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
      </div>
    );
  }
  return children;
};

// Search and Filter Component
const SearchAndFilter = ({ searchTerm, setSearchTerm, sortBy, setSortBy, sortOptions, placeholder }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-search text-gray-400"></i>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    </div>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      {sortOptions.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 rounded-lg border ${
              page === currentPage
                ? 'bg-purple-600 text-white border-purple-600'
                : page === '...'
                ? 'border-gray-300 cursor-default'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, type = 'default' }) => {
  const variants = {
    job: {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    role: {
      admin: 'bg-red-100 text-red-800 border-red-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    type: {
      creator: 'bg-blue-100 text-blue-800 border-blue-200',
      talent: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    boolean: {
      true: 'bg-green-100 text-green-800 border-green-200',
      false: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const variant = variants[type]?.[status] || variants.default || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant}`}>
      {status}
    </span>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDestructive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [travelPlans, setTravelPlans] = useState([]);
  
  // UI states
  const [section, setSection] = useState('overview');
  const [loadingStates, setLoadingStates] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  
  // Search and filter states
  const [searchTerms, setSearchTerms] = useState({
    users: '',
    jobs: '',
    articles: '',
    travel: ''
  });
  const [sortBy, setSortBy] = useState({
    users: 'created_at',
    jobs: 'created_at',
    articles: 'created_at',
    travel: 'created_at'
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState({
    users: 1,
    jobs: 1,
    articles: 1,
    travel: 1
  });
  const ITEMS_PER_PAGE = 10;
  
  // News form states
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    image_url: '',
    source: '',
    full_article: '',
    priority: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Authentication check
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || data?.role !== 'admin') return router.push('/');
        setUser(user);
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/');
      }
    };
    fetchAdmin();
  }, [router]);

  // Data fetching with error handling
  const fetchData = useCallback(async (dataType = 'all') => {
    if (!user) return;
    
    setLoadingStates(prev => ({ ...prev, [dataType]: true }));
    
    try {
      const queries = {
        users: () => supabase.from('profiles').select('id, full_name, email, type, role, created_at').order('created_at', { ascending: false }),
        jobs: () => supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
        articles: () => supabase.from('news_articles').select('*').order('created_at', { ascending: false }),
        travel: () => supabase.from('creator_travel_plans').select('*').order('created_at', { ascending: false })
      };

      if (dataType === 'all') {
        const [usersRes, jobsRes, articlesRes, travelRes] = await Promise.all([
          queries.users(),
          queries.jobs(),
          queries.articles(),
          queries.travel()
        ]);

        setUsers(usersRes.data || []);
        setJobs(jobsRes.data || []);
        setArticles(articlesRes.data || []);
        setTravelPlans(travelRes.data || []);
      } else if (queries[dataType]) {
        const { data, error } = await queries[dataType]();
        if (error) throw error;
        
        switch (dataType) {
          case 'users': setUsers(data || []); break;
          case 'jobs': setJobs(data || []); break;
          case 'articles': setArticles(data || []); break;
          case 'travel': setTravelPlans(data || []); break;
        }
      }
    } catch (err) {
      showMessage(`Failed to fetch ${dataType}: ${err.message}`, true);
    } finally {
      setLoadingStates(prev => ({ ...prev, [dataType]: false }));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
      setLoading(false);
    }
  }, [user, fetchData]);

  // Utility functions
  const showMessage = useCallback((message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  }, []);

  const showConfirmModal = useCallback((title, message, onConfirm, isDestructive = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDestructive
    });
  }, []);

  // Image handling
  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File too large. Please choose an image under 5MB.");
      }

      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file.");
      }

      const extension = file.name.split(".").pop();
      const fileName = `news-${Date.now()}.${extension}`;
      const path = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      showMessage(error.message, true);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // CRUD operations
  const handleRoleChange = async (userId, newRole) => {
    const action = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        
        if (error) {
          throw new Error(error.message);
        }
        
        showMessage(`User role updated successfully!`);
        await fetchData('users');
      } catch (err) {
        showMessage('Failed to update user role: ' + err.message, true);
      }
    };

    showConfirmModal(
      'Change User Role',
      `Are you sure you want to ${newRole ? `promote this user to ${newRole}` : 'remove admin privileges'}?`,
      action
    );
  };

  const handleJobApproval = async (jobId, status) => {
    try {
      const { error } = await supabase.from('job_postings').update({ status }).eq('id', jobId);
      if (error) throw error;
      
      showMessage(`Job ${status} successfully!`);
      await fetchData('jobs');
    } catch (err) {
      showMessage('Failed to update job status: ' + err.message, true);
    }
  };

  const handleDeleteTravelPlan = async (planId) => {
    const action = async () => {
      try {
        const { error } = await supabase.from('creator_travel_plans').delete().eq('id', planId);
        if (error) throw error;
        
        showMessage('Travel plan deleted successfully!');
        await fetchData('travel');
      } catch (err) {
        showMessage('Failed to delete travel plan: ' + err.message, true);
      }
    };

    showConfirmModal(
      'Delete Travel Plan',
      'This action cannot be undone. Are you sure?',
      action,
      true
    );
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let finalFormData = { ...formData };

      if (imageFile) {
        const uploadedImageUrl = await handleImageUpload(imageFile);
        if (uploadedImageUrl) {
          finalFormData.image_url = uploadedImageUrl;
        } else {
          return;
        }
      }

      if (editingId) {
        const { error } = await supabase.from('news_articles').update(finalFormData).eq('id', editingId);
        if (error) throw error;
        showMessage('Article updated successfully!');
        setEditingId(null);
      } else {
        const { error } = await supabase.from('news_articles').insert([finalFormData]);
        if (error) throw error;
        showMessage('Article created successfully!');
      }
      
      resetForm();
      await fetchData('articles');
    } catch (err) {
      showMessage('Failed to save article: ' + err.message, true);
    }
  };

  const handleNewsEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title || '',
      summary: article.summary || '',
      image_url: article.image_url || '',
      source: article.source || '',
      full_article: article.full_article || '',
      priority: article.priority || 1,
    });
    clearImageSelection();
    setSection('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsDelete = async (id) => {
    const action = async () => {
      try {
        const { error } = await supabase.from('news_articles').delete().eq('id', id);
        if (error) throw error;
        
        showMessage('Article deleted successfully!');
        await fetchData('articles');
      } catch (err) {
        showMessage('Failed to delete article: ' + err.message, true);
      }
    };

    showConfirmModal(
      'Delete Article',
      'This action cannot be undone. Are you sure?',
      action,
      true
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      image_url: '',
      source: '',
      full_article: '',
      priority: 1,
    });
    clearImageSelection();
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
    if (fileInput) fileInput.value = '';
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered and paginated data
  const getFilteredAndPaginatedData = (data, searchTerm, sortField, currentPage) => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(item => {
        const searchableFields = Object.values(item).join(' ').toLowerCase();
        return searchableFields.includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortField.includes('date') || sortField === 'created_at') {
        return new Date(bVal) - new Date(aVal);
      }
      return String(aVal).localeCompare(String(bVal));
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { data: paginatedData, totalPages, totalItems: filtered.length };
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    activeJobs: jobs.filter(j => j.is_active).length,
    pendingJobs: jobs.filter(j => j.status === 'pending').length,
    totalArticles: articles.length,
    featuredArticles: articles.filter(a => a.priority > 2).length,
    totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
    thisWeekArticles: articles.filter(a => {
      const created = new Date(a.created_at);
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return created > week;
    }).length,
    activeTravelPlans: travelPlans.filter(p => new Date(p.end_date) > new Date()).length
  }), [users, jobs, articles, travelPlans]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading admin panel...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const { data: filteredUsers, totalPages: usersTotalPages } = getFilteredAndPaginatedData(
    users, searchTerms.users, sortBy.users, currentPage.users
  );
  const { data: filteredJobs, totalPages: jobsTotalPages } = getFilteredAndPaginatedData(
    jobs, searchTerms.jobs, sortBy.jobs, currentPage.jobs
  );
  const { data: filteredArticles, totalPages: articlesTotalPages } = getFilteredAndPaginatedData(
    articles, searchTerms.articles, sortBy.articles, currentPage.articles
  );
  const { data: filteredTravelPlans, totalPages: travelTotalPages } = getFilteredAndPaginatedData(
    travelPlans, searchTerms.travel, sortBy.travel, currentPage.travel
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
              <i className="fas fa-crown text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your platform with comprehensive controls</p>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle mr-3"></i>
                {error}
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm">
              <div className="flex items-center">
                <i className="fas fa-check-circle mr-3"></i>
                {success}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'overview', label: 'Overview', icon: 'fas fa-chart-pie', color: 'from-blue-500 to-blue-600' },
              { key: 'users', label: 'Users', icon: 'fas fa-users', color: 'from-green-500 to-green-600' },
              { key: 'jobs', label: 'Jobs', icon: 'fas fa-briefcase', color: 'from-yellow-500 to-yellow-600' },
              { key: 'popups', label: 'Popups', icon: 'fas fa-popup', color: 'from-indigo-500 to-indigo-600' },
              { key: 'news', label: 'News', icon: 'fas fa-newspaper', color: 'from-purple-500 to-purple-600' },
              { key: 'travel', label: 'Travel', icon: 'fas fa-map-marker-alt', color: 'from-pink-500 to-pink-600' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSection(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  section === tab.key 
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105` 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <i className={tab.icon}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        {section === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-500">{stats.adminUsers} admins</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <i className="fas fa-users text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
                    <p className="text-sm text-gray-500">{stats.pendingJobs} pending</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <i className="fas fa-briefcase text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">News Articles</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
                    <p className="text-sm text-gray-500">{stats.thisWeekArticles} this week</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <i className="fas fa-newspaper text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Views</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{stats.activeTravelPlans} active travels</p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-full">
                    <i className="fas fa-eye text-pink-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-clock text-blue-600 mr-3"></i>
                  Recent Jobs
                </h3>
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                        <p className="text-sm text-gray-500">{job.location || 'Remote'}</p>
                      </div>
                      <StatusBadge status={job.status || 'pending'} type="job" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-newspaper text-purple-600 mr-3"></i>
                  Latest Articles
                </h3>
                <div className="space-y-3">
                  {articles.slice(0, 5).map(article => (
                    <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{article.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Priority {article.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {section === 'users' && (
          <ErrorBoundary error={error} retry={() => fetchData('users')}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <i className="fas fa-users text-blue-600 mr-3"></i>
                    Users Management
                  </h2>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                    {users.length} total users
                  </div>
                </div>
              </div>

              <div className="p-6">
                <SearchAndFilter
                  searchTerm={searchTerms.users}
                  setSearchTerm={(term) => setSearchTerms(prev => ({ ...prev, users: term }))}
                  sortBy={sortBy.users}
                  setSortBy={(sort) => setSortBy(prev => ({ ...prev, users: sort }))}
                  sortOptions={[
                    { value: 'created_at', label: 'Recently Joined' },
                    { value: 'full_name', label: 'Name (A-Z)' },
                    { value: 'email', label: 'Email (A-Z)' },
                    { value: 'type', label: 'User Type' }
                  ]}
                  placeholder="Search users by name, email, or type..."
                />

                {loadingStates.users ? (
                  <TableSkeleton />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{u.full_name || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{u.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={u.type || 'Unknown'} type="type" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={u.role || 'user'} type="role" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                {u.role !== 'admin' ? (
                                  <button 
                                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors font-medium" 
                                    onClick={() => handleRoleChange(u.id, 'admin')}
                                  >
                                    <i className="fas fa-arrow-up mr-1"></i>
                                    Promote
                                  </button>
                                ) : u.id !== user.id ? (
                                  <button 
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium" 
                                    onClick={() => handleRoleChange(u.id, null)}
                                  >
                                    <i className="fas fa-arrow-down mr-1"></i>
                                    Demote
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-xs">Current Admin</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage.users}
                      totalPages={usersTotalPages}
                      onPageChange={(page) => setCurrentPage(prev => ({ ...prev, users: page }))}
                    />
                  </>
                )}
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* Jobs Section */}
        {section === 'jobs' && (
          <ErrorBoundary error={error} retry={() => fetchData('jobs')}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <i className="fas fa-briefcase text-green-600 mr-3"></i>
                    Jobs Management
                  </h2>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                    {jobs.length} total jobs
                  </div>
                </div>
              </div>

              <div className="p-6">
                <SearchAndFilter
                  searchTerm={searchTerms.jobs}
                  setSearchTerm={(term) => setSearchTerms(prev => ({ ...prev, jobs: term }))}
                  sortBy={sortBy.jobs}
                  setSortBy={(sort) => setSortBy(prev => ({ ...prev, jobs: sort }))}
                  sortOptions={[
                    { value: 'created_at', label: 'Recently Posted' },
                    { value: 'title', label: 'Title (A-Z)' },
                    { value: 'status', label: 'Status' },
                    { value: 'location', label: 'Location' }
                  ]}
                  placeholder="Search jobs by title, location, or description..."
                />

                {loadingStates.jobs ? (
                  <TableSkeleton />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compensation</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{job.title}</div>
                                  <div className="text-sm text-gray-500 max-w-xs truncate">{job.description}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                                {job.location || 'Remote'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {job.pay || 'Confidential'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={job.status || 'pending'} type="job" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(job.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                <button 
                                  onClick={() => handleJobApproval(job.id, 'approved')} 
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors font-medium"
                                >
                                  <i className="fas fa-check mr-1"></i>
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleJobApproval(job.id, 'rejected')} 
                                  className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                >
                                  <i className="fas fa-times mr-1"></i>
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage.jobs}
                      totalPages={jobsTotalPages}
                      onPageChange={(page) => setCurrentPage(prev => ({ ...prev, jobs: page }))}
                    />
                  </>
                )}
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* Travel Plans Section */}
        {section === 'travel' && (
          <ErrorBoundary error={error} retry={() => fetchData('travel')}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-pink-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <i className="fas fa-map-marker-alt text-pink-600 mr-3"></i>
                    Travel Plans
                  </h2>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                    {travelPlans.length} total plans
                  </div>
                </div>
              </div>

              <div className="p-6">
                <SearchAndFilter
                  searchTerm={searchTerms.travel}
                  setSearchTerm={(term) => setSearchTerms(prev => ({ ...prev, travel: term }))}
                  sortBy={sortBy.travel}
                  setSortBy={(sort) => setSortBy(prev => ({ ...prev, travel: sort }))}
                  sortOptions={[
                    { value: 'created_at', label: 'Recently Added' },
                    { value: 'start_date', label: 'Start Date' },
                    { value: 'location', label: 'Location (A-Z)' },
                    { value: 'creator_name', label: 'Creator (A-Z)' }
                  ]}
                  placeholder="Search travel plans by creator or location..."
                />

                {loadingStates.travel ? (
                  <TableSkeleton />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Dates</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collaboration</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredTravelPlans.map((plan) => {
                            const isActive = new Date(plan.end_date) > new Date();
                            return (
                              <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{plan.creator_name || 'Unknown'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                                    {plan.location}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <span>{new Date(plan.start_date).toLocaleDateString()}</span>
                                    <span className="text-xs text-gray-400">to {new Date(plan.end_date).toLocaleDateString()}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <StatusBadge status={plan.open_to_collab ? 'true' : 'false'} type="boolean" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isActive 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                                  }`}>
                                    {isActive ? 'Active' : 'Expired'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button 
                                    onClick={() => handleDeleteTravelPlan(plan.id)} 
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                  >
                                    <i className="fas fa-trash mr-1"></i>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage.travel}
                      totalPages={travelTotalPages}
                      onPageChange={(page) => setCurrentPage(prev => ({ ...prev, travel: page }))}
                    />
                  </>
                )}
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* Popup Management Section */}
        {section === 'popups' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <PopupManager />
          </div>
        )}

        {/* News Section */}
        {section === 'news' && (
          <ErrorBoundary error={error} retry={() => fetchData('articles')}>
            <div className="space-y-8">
              {/* Enhanced Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Articles</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <i className="fas fa-newspaper text-blue-600 text-xl"></i>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Featured</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.featuredArticles}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <i className="fas fa-star text-green-600 text-xl"></i>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Views</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <i className="fas fa-eye text-yellow-600 text-xl"></i>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">This Week</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.thisWeekArticles}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <i className="fas fa-calendar text-purple-600 text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus'} text-purple-600 mr-3`}></i>
                  {editingId ? 'Edit Article' : 'Create New Article'}
                </h2>
                
                <form onSubmit={handleNewsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Article Title *</label>
                      <input 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        placeholder="Enter compelling article title" 
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                      <select 
                        value={formData.priority} 
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} 
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                      >
                        <option value={1}>📝 Normal (1)</option>
                        <option value={2}>⭐ Featured (2)</option>
                        <option value={3}>🔥 High Priority (3)</option>
                        <option value={4}>⚡ Very High (4)</option>
                        <option value={5}>🚨 Critical (5)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Article Summary</label>
                    <textarea 
                      value={formData.summary} 
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })} 
                      placeholder="Brief summary for preview cards and SEO optimization" 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" 
                      rows={3} 
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Characters: {formData.summary.length}/200
                      </p>
                      <p className={`text-xs ${formData.summary.length >= 120 && formData.summary.length <= 160 ? 'text-green-600' : 'text-gray-500'}`}>
                        SEO optimal: 120-160 characters
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImage}
                        />
                        <label 
                          htmlFor="image-upload" 
                          className={`cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploadingImage ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </div>
                          ) : imagePreview ? (
                            <div className="space-y-3">
                              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mx-auto" />
                              <p className="text-sm text-green-600">
                                <i className="fas fa-check mr-1"></i>
                                {imageFile?.name}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  clearImageSelection();
                                }}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                              >
                                <i className="fas fa-times mr-1"></i>Remove
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                              <div>
                                <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                                <p className="text-xs text-gray-500">Max 5MB • JPG, PNG, GIF</p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Or use URL:</label>
                        <input 
                          value={formData.image_url} 
                          onChange={(e) => {
                            setFormData({ ...formData, image_url: e.target.value });
                            clearImageSelection();
                          }} 
                          placeholder="https://example.com/image.jpg" 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source Attribution</label>
                      <input 
                        value={formData.source} 
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })} 
                        placeholder="e.g., FanGigs Editorial, TechCrunch, etc." 
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Article Content *</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 p-3 border-b border-gray-300 flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[placeholder*="Full article"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const selectedText = text.substring(start, end);
                            const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                            setFormData({ ...formData, full_article: newText });
                          }}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 font-bold"
                          title="Bold"
                        >
                          <i className="fas fa-bold"></i>
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[placeholder*="Full article"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const selectedText = text.substring(start, end);
                            const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                            setFormData({ ...formData, full_article: newText });
                          }}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 italic"
                          title="Italic"
                        >
                          <i className="fas fa-italic"></i>
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, full_article: formData.full_article + '\n\n---\n\n' });
                          }}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                          title="Add Separator"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                      <textarea 
                        value={formData.full_article} 
                        onChange={(e) => setFormData({ ...formData, full_article: e.target.value })} 
                        placeholder="Write your full article content here. You can use **bold**, *italic*, and other markdown formatting." 
                        className="w-full p-4 border-none focus:ring-0 focus:outline-none resize-none" 
                        rows={12}
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        Words: {formData.full_article.split(/\s+/).filter(w => w.length > 0).length}
                        {' | '}
                        Characters: {formData.full_article.length}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">**bold**</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">*italic*</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">--- separator</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6">
                    <button 
                      type="submit" 
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                    >
                      <i className={`fas ${editingId ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                      {editingId ? 'Update Article' : 'Create Article'}
                    </button>
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingId(null);
                          resetForm();
                        }}
                        className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-semibold transition-all flex items-center"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition-all flex items-center"
                    >
                      <i className="fas fa-eraser mr-2"></i>
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>

              {/* Articles List */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <i className="fas fa-newspaper text-purple-600 mr-3"></i>
                    Articles Management
                  </h2>
                </div>

                <div className="p-6">
                  <SearchAndFilter
                    searchTerm={searchTerms.articles}
                    setSearchTerm={(term) => setSearchTerms(prev => ({ ...prev, articles: term }))}
                    sortBy={sortBy.articles}
                    setSortBy={(sort) => setSortBy(prev => ({ ...prev, articles: sort }))}
                    sortOptions={[
                      { value: 'created_at', label: 'Recently Created' },
                      { value: 'title', label: 'Title (A-Z)' },
                      { value: 'priority', label: 'Priority (High to Low)' },
                      { value: 'views', label: 'Most Viewed' }
                    ]}
                    placeholder="Search articles by title or content..."
                  />

                  {loadingStates.articles ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                          <div className="bg-gray-200 h-4 rounded mb-2"></div>
                          <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map((article) => (
                          <div key={article.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <div className="relative">
                              {article.image_url ? (
                                <img 
                                  src={article.image_url} 
                                  alt={article.title} 
                                  className="w-full h-48 object-cover" 
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                  <i className="fas fa-newspaper text-gray-400 text-4xl"></i>
                                </div>
                              )}
                              <div style={{display: 'none'}} className="w-full h-48 bg-red-100 flex items-center justify-center text-red-600">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Image failed to load
                              </div>
                              <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  article.priority >= 4 ? 'bg-red-500 text-white' :
                                  article.priority >= 3 ? 'bg-orange-500 text-white' :
                                  article.priority >= 2 ? 'bg-yellow-500 text-white' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  P{article.priority}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-6">
                              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">{article.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.summary || 'No summary available'}</p>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <span className="flex items-center">
                                  <i className="fas fa-calendar mr-1"></i>
                                  {new Date(article.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <i className="fas fa-eye mr-1"></i>
                                  {article.views || 0} views
                                </span>
                                <span>
                                  {article.full_article?.split(/\s+/).filter(w => w.length > 0).length || 0} words
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <a 
                                  href={`/news/${article.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center hover:underline"
                                >
                                  <i className="fas fa-external-link-alt mr-1"></i>
                                  Preview
                                </a>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleNewsEdit(article)} 
                                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium transition-colors"
                                    title="Edit Article"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    onClick={() => handleNewsDelete(article.id)} 
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
                                    title="Delete Article"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {filteredArticles.length === 0 && !loadingStates.articles && (
                        <div className="text-center py-16">
                          <i className="fas fa-newspaper text-gray-300 text-6xl mb-4"></i>
                          <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                          <p className="text-gray-600">Create your first article to get started.</p>
                        </div>
                      )}

                      <Pagination
                        currentPage={currentPage.articles}
                        totalPages={articlesTotalPages}
                        onPageChange={(page) => setCurrentPage(prev => ({ ...prev, articles: page }))}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ isOpen: false });
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
    </main>
  );
}
