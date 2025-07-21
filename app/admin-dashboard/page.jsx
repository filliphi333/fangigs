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
  const [section, setSection] = useState('users');
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/');
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data.role !== 'admin') return router.push('/');
      setUser(user);
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase.from('profiles').select('id, full_name, email, type, role');
      const { data: jobsData } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false });
      const { data: articlesData } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });

      setUsers(usersData || []);
      setJobs(jobsData || []);
      setArticles(articlesData || []);
    };

    fetchData();
  }, []);

  const handleNewsSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase.from('news_articles').update(formData).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        const { data } = await supabase.from('news_articles').select('*');
        setArticles(data);
      }
    } else {
      const { error } = await supabase.from('news_articles').insert([formData]);
      if (!error) {
        resetForm();
        const { data } = await supabase.from('news_articles').select('*');
        setArticles(data);
      }
    }
  };

  const handleNewsEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      summary: article.summary,
      image_url: article.image_url,
      source: article.source,
      full_article: article.full_article,
      priority: article.priority,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsDelete = async (id) => {
    if (confirm('Delete this article?')) {
      await supabase.from('news_articles').delete().eq('id', id);
      const { data } = await supabase.from('news_articles').select('*');
      setArticles(data);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    const { data } = await supabase.from('profiles').select('id, full_name, email, type, role');
    setUsers(data);
  };

  const handleJobApproval = async (jobId, status) => {
    await supabase.from('job_postings').update({ status }).eq('id', jobId);
    const { data } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false });
    setJobs(data);
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

  if (!user) return <div className="p-4">Loading admin panel...</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">👨‍💼 FanGigs ADMIN DASHBOARD</h1>

      <div className="flex space-x-4 mb-6">
        <button onClick={() => setSection('users')} className="px-4 py-2 bg-blue-500 text-white rounded">Users</button>
        <button onClick={() => setSection('jobs')} className="px-4 py-2 bg-green-500 text-white rounded">Jobs</button>
        <button onClick={() => setSection('news')} className="px-4 py-2 bg-yellow-500 text-white rounded">News</button>
      </div>

      {section === 'users' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Type</th>
                <th className="p-2">Role</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-blue-50">
                  <td className="p-2">{u.full_name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.type}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 space-x-2">
                    {u.role !== 'admin' && (
                      <button className="text-sm text-green-600" onClick={() => handleRoleChange(u.id, 'admin')}>Promote</button>
                    )}
                    {u.role === 'admin' && (
                      <button className="text-sm text-red-600" onClick={() => handleRoleChange(u.id, null)}>Demote</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {section === 'jobs' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Job Postings</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Title</th>
                <th className="p-2">Location</th>
                <th className="p-2">Pay</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-green-50">
                  <td className="p-2">{job.title}</td>
                  <td className="p-2">{job.location}</td>
                  <td className="p-2">{job.pay || 'Confidential'}</td>
                  <td className="p-2">{job.status || 'pending'}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleJobApproval(job.id, 'approved')} className="text-sm text-green-600">Approve</button>
                    <button onClick={() => handleJobApproval(job.id, 'rejected')} className="text-sm text-red-600">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {section === 'news' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Article' : 'Create News Article'}</h2>
          <form onSubmit={handleNewsSubmit} className="space-y-4 mb-8">
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title" className="w-full p-2 border rounded" required />
            <textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Summary" className="w-full p-2 border rounded" rows={2} />
            <input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="Image URL" className="w-full p-2 border rounded" />
            <textarea value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="Source" className="w-full p-2 border rounded" />
            <textarea value={formData.full_article} onChange={(e) => setFormData({ ...formData, full_article: e.target.value })} placeholder="Full article content" className="w-full p-2 border rounded" rows={6} />
            <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} placeholder="Priority (1–5)" className="w-full p-2 border rounded" min={1} max={5} />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {editingId ? 'Update Article' : 'Create Article'}
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-2">Existing Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded shadow p-4">
                {article.image_url && (
                  <img src={article.image_url} alt={article.title} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <h3 className="text-lg font-bold">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.summary}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => handleNewsEdit(article)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                  <button onClick={() => handleNewsDelete(article.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
