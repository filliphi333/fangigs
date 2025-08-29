
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [travelPlans, setTravelPlans] = useState([]);
  const [section, setSection] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [usersRes, jobsRes, articlesRes, travelRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email, type, role').order('created_at', { ascending: false }),
          supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
          supabase.from('news_articles').select('*').order('created_at', { ascending: false }),
          supabase.from('creator_travel_plans').select('*').order('created_at', { ascending: false })
        ]);

        setUsers(usersRes.data || []);
        setJobs(jobsRes.data || []);
        setArticles(articlesRes.data || []);
        setTravelPlans(travelRes.data || []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const showMessage = (message, isError = false) => {
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
    }, 3000);
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);

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
      const fileName = `news-${Date.now()}.${extension}`;
      const path = `news-images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
    // Clear file input
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
    if (fileInput) fileInput.value = '';
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let finalFormData = { ...formData };

      // Handle image upload if a file is selected
      if (imageFile) {
        const uploadedImageUrl = await handleImageUpload(imageFile);
        if (uploadedImageUrl) {
          finalFormData.image_url = uploadedImageUrl;
        } else {
          return; // Upload failed, don't proceed
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
      // Refresh articles
      const { data } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
      setArticles(data || []);
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
    clearImageSelection(); // Clear any pending uploads
    setSection('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase.from('news_articles').delete().eq('id', id);
      if (error) throw error;
      
      showMessage('Article deleted successfully!');
      const { data } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
      setArticles(data || []);
    } catch (err) {
      showMessage('Failed to delete article: ' + err.message, true);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      
      showMessage(`User role updated successfully!`);
      const { data } = await supabase.from('profiles').select('id, full_name, email, type, role').order('created_at', { ascending: false });
      setUsers(data || []);
    } catch (err) {
      showMessage('Failed to update user role: ' + err.message, true);
    }
  };

  const handleJobApproval = async (jobId, status) => {
    try {
      const { error } = await supabase.from('job_postings').update({ status }).eq('id', jobId);
      if (error) throw error;
      
      showMessage(`Job ${status} successfully!`);
      const { data } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false });
      setJobs(data || []);
    } catch (err) {
      showMessage('Failed to update job status: ' + err.message, true);
    }
  };

  const handleDeleteTravelPlan = async (planId) => {
    if (!confirm('Delete this travel plan?')) return;
    
    try {
      const { error } = await supabase.from('creator_travel_plans').delete().eq('id', planId);
      if (error) throw error;
      
      showMessage('Travel plan deleted successfully!');
      const { data } = await supabase.from('creator_travel_plans').select('*').order('created_at', { ascending: false });
      setTravelPlans(data || []);
    } catch (err) {
      showMessage('Failed to delete travel plan: ' + err.message, true);
    }
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

  const getStatusBadge = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.pending;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          👨‍💼 FanGigs Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage users, jobs, articles, and platform content</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'users', label: 'Users', color: 'bg-blue-500 hover:bg-blue-600' },
          { key: 'jobs', label: 'Jobs', color: 'bg-green-500 hover:bg-green-600' },
          { key: 'news', label: 'News', color: 'bg-yellow-500 hover:bg-yellow-600' },
          { key: 'travel', label: 'Travel Plans', color: 'bg-purple-500 hover:bg-purple-600' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            className={`px-4 py-2 text-white rounded font-medium transition ${
              section === tab.key ? tab.color.replace('hover:', '') : tab.color
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Section */}
      {section === 'users' && (
        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{u.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {u.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {u.role !== 'admin' && (
                        <button 
                          className="text-green-600 hover:text-green-800 font-medium" 
                          onClick={() => handleRoleChange(u.id, 'admin')}
                        >
                          Promote to Admin
                        </button>
                      )}
                      {u.role === 'admin' && u.id !== user.id && (
                        <button 
                          className="text-red-600 hover:text-red-800 font-medium" 
                          onClick={() => handleRoleChange(u.id, null)}
                        >
                          Remove Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Jobs Section */}
      {section === 'jobs' && (
        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Job Postings ({jobs.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{job.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.location || 'Remote'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.pay || 'Confidential'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(job.status)}`}>
                        {job.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => handleJobApproval(job.id, 'approved')} 
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleJobApproval(job.id, 'rejected')} 
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Travel Plans Section */}
      {section === 'travel' && (
        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Creator Travel Plans ({travelPlans.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open to Collab</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {travelPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {plan.creator_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {plan.start_date} - {plan.end_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plan.open_to_collab ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.open_to_collab ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleDeleteTravelPlan(plan.id)} 
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* News Section */}
      {section === 'news' && (
        <section className="space-y-6">
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <i className="fas fa-newspaper text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                  <p className="text-sm text-gray-600">Total Articles</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <i className="fas fa-star text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {articles.filter(a => a.priority > 1).length}
                  </p>
                  <p className="text-sm text-gray-600">Featured Articles</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <i className="fas fa-eye text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <i className="fas fa-calendar text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {articles.filter(a => {
                      const created = new Date(a.created_at);
                      const week = new Date();
                      week.setDate(week.getDate() - 7);
                      return created > week;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Article' : 'Create News Article'}</h2>
            <form onSubmit={handleNewsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Article Title *</label>
                  <input 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="Enter compelling article title" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={1}>Normal (1)</option>
                    <option value={2}>Featured (2)</option>
                    <option value={3}>High Priority (3)</option>
                    <option value={4}>Very High (4)</option>
                    <option value={5}>Critical (5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article Summary</label>
                <textarea 
                  value={formData.summary} 
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })} 
                  placeholder="Brief summary for preview cards and SEO" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  rows={3} 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {formData.summary.length}/200 (recommended: 120-160 for SEO)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  
                  {/* Tab-like interface for upload vs URL */}
                  <div className="flex border-b border-gray-200 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById('upload-tab').classList.remove('hidden');
                        document.getElementById('url-tab').classList.add('hidden');
                        document.querySelector('[data-tab="upload"]').classList.add('border-purple-500', 'text-purple-600');
                        document.querySelector('[data-tab="url"]').classList.remove('border-purple-500', 'text-purple-600');
                      }}
                      data-tab="upload"
                      className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-500 hover:text-purple-700"
                    >
                      <i className="fas fa-upload mr-2"></i>Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById('upload-tab').classList.add('hidden');
                        document.getElementById('url-tab').classList.remove('hidden');
                        document.querySelector('[data-tab="url"]').classList.add('border-purple-500', 'text-purple-600');
                        document.querySelector('[data-tab="upload"]').classList.remove('border-purple-500', 'text-purple-600');
                      }}
                      data-tab="url"
                      className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700"
                    >
                      <i className="fas fa-link mr-2"></i>Image URL
                    </button>
                  </div>

                  {/* Upload tab */}
                  <div id="upload-tab">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
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
                          <div className="space-y-2">
                            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mx-auto" />
                            <p className="text-sm text-green-600">
                              <i className="fas fa-check mr-1"></i>
                              Image selected: {imageFile?.name}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearImageSelection();
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-times mr-1"></i>Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                            <p className="text-sm text-gray-600">
                              Click to upload an image<br />
                              <span className="text-xs text-gray-500">Max 5MB • JPG, PNG, GIF</span>
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* URL tab */}
                  <div id="url-tab" className="hidden">
                    <input 
                      value={formData.image_url} 
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        clearImageSelection(); // Clear upload when using URL
                      }} 
                      placeholder="https://example.com/image.jpg" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    />
                    {formData.image_url && !imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-32 bg-red-100 rounded-lg flex items-center justify-center text-red-600" style={{display: 'none'}}>
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Invalid image URL
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Attribution</label>
                  <input 
                    value={formData.source} 
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })} 
                    placeholder="e.g., FanGigs Editorial, TechCrunch, etc." 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article Content *</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-2 border-b border-gray-300 flex gap-2">
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
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
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
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                      title="Italic"
                    >
                      <i className="fas fa-italic"></i>
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const newText = formData.full_article + '\n\n---\n\n';
                        setFormData({ ...formData, full_article: newText });
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                      title="Add Separator"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                  </div>
                  <textarea 
                    value={formData.full_article} 
                    onChange={(e) => setFormData({ ...formData, full_article: e.target.value })} 
                    placeholder="Write your full article content here. You can use **bold**, *italic*, and other markdown formatting." 
                    className="w-full p-3 border-none focus:ring-0 focus:outline-none resize-none" 
                    rows={12}
                    style={{ minHeight: '300px' }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Words: {formData.full_article.split(/\s+/).filter(w => w.length > 0).length}
                    {' | '}
                    Characters: {formData.full_article.length}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>**bold**</span>
                    <span>*italic*</span>
                    <span>--- separator</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition flex items-center"
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
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition flex items-center"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition flex items-center"
                >
                  <i className="fas fa-eraser mr-2"></i>
                  Clear Form
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Existing Articles ({articles.length})</h2>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Search articles..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filteredArticles = articles.filter(article => 
                        article.title.toLowerCase().includes(searchTerm) ||
                        article.summary?.toLowerCase().includes(searchTerm)
                      );
                      setArticles(filteredArticles);
                    }}
                  />
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => {
                      const priority = parseInt(e.target.value);
                      if (priority === 0) {
                        // Show all - refetch
                        const fetchArticles = async () => {
                          const { data } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
                          setArticles(data || []);
                        };
                        fetchArticles();
                      } else {
                        const filtered = articles.filter(article => article.priority === priority);
                        setArticles(filtered);
                      }
                    }}
                  >
                    <option value={0}>All Priorities</option>
                    <option value={1}>Normal (1)</option>
                    <option value={2}>Featured (2)</option>
                    <option value={3}>High (3)</option>
                    <option value={4}>Very High (4)</option>
                    <option value={5}>Critical (5)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {article.image_url ? (
                    <img 
                      src={article.image_url} 
                      alt={article.title} 
                      className="w-full h-40 object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <i className="fas fa-newspaper text-gray-400 text-3xl"></i>
                    </div>
                  )}
                  <div style={{display: 'none'}} className="w-full h-40 bg-red-100 flex items-center justify-center text-red-600">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Image failed to load
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold line-clamp-2 flex-1 mr-2">{article.title}</h3>
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          article.priority >= 4 ? 'bg-red-100 text-red-800' :
                          article.priority >= 3 ? 'bg-orange-100 text-orange-800' :
                          article.priority >= 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          Priority {article.priority}
                        </span>
                        {article.views > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {article.views} views
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{article.summary || 'No summary available'}</p>
                    <div className="text-xs text-gray-500 mb-4">
                      <div className="flex items-center justify-between">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          {article.full_article?.split(/\s+/).filter(w => w.length > 0).length || 0} words
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <a 
                        href={`/news/${article.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>
                        Preview
                      </a>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleNewsEdit(article)} 
                          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium transition flex items-center"
                          title="Edit Article"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
                              handleNewsDelete(article.id);
                            }
                          }} 
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition flex items-center"
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
            {articles.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-newspaper text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">Create your first article to get started.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
