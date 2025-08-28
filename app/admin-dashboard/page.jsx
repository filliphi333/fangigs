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

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase.from('news_articles').update(formData).eq('id', editingId);
        if (error) throw error;
        showMessage('Article updated successfully!');
        setEditingId(null);
      } else {
        const { error } = await supabase.from('news_articles').insert([formData]);
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
      const { data } = await supabase.from('creator_travel_plans').select('*, profiles(full_name, vanity_username)').order('created_at', { ascending: false });
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.location}</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
  {plan.start_date && plan.end_date
    ? `${new Date(plan.start_date).toLocaleDateString()} - ${new Date(plan.end_date).toLocaleDateString()}`
    : 'N/A'}
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Article' : 'Create News Article'}</h2>
            <form onSubmit={handleNewsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  placeholder="Article Title" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  required 
                />
                <input 
                  type="number" 
                  value={formData.priority} 
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} 
                  placeholder="Priority (1-5)" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  min={1} 
                  max={5} 
                />
              </div>
              <textarea 
                value={formData.summary} 
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })} 
                placeholder="Article Summary" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                rows={3} 
              />
              <input 
                value={formData.image_url} 
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                placeholder="Image URL" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
              <input 
                value={formData.source} 
                onChange={(e) => setFormData({ ...formData, source: e.target.value })} 
                placeholder="Source (optional)" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
              <textarea 
                value={formData.full_article} 
                onChange={(e) => setFormData({ ...formData, full_article: e.target.value })} 
                placeholder="Full article content" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                rows={8} 
              />
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition"
                >
                  {editingId ? 'Update Article' : 'Create Article'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Existing Articles ({articles.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                  {article.image_url && (
                    <img 
                      src={article.image_url} 
                      alt={article.title} 
                      className="w-full h-40 object-cover" 
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold line-clamp-2">{article.title}</h3>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Priority {article.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.summary}</p>
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleNewsEdit(article)} 
                        className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleNewsDelete(article.id)} 
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}