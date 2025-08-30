
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ManagePortfolio() {
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [profile, setProfile] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    project_type: '',
    collaborators: [],
    project_date: '',
    media_links: [],
    is_public: true
  });
  const [newCollaborator, setNewCollaborator] = useState({ name: '', social_handle: '', platform: '' });
  const [newMediaLink, setNewMediaLink] = useState('');
  const router = useRouter();

  const PROJECT_TYPES = [
    'Solo Content',
    'B/G Scene',
    'G/G Scene',
    'Group Scene',
    'Commercial/Advertisement',
    'Webcam Performance',
    'Photography Shoot',
    'Video Production',
    'Social Media Content',
    'Other'
  ];

  const SOCIAL_PLATFORMS = [
    'Twitter/X',
    'Instagram',
    'OnlyFans',
    'Snapchat',
    'TikTok',
    'YouTube',
    'Website',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch portfolio items
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('talent_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('project_date', { ascending: false });

      if (portfolioError) throw portfolioError;
      setPortfolioItems(portfolioData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const portfolioData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('talent_portfolio')
          .update(portfolioData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        setPortfolioItems(prev => 
          prev.map(item => item.id === editingItem.id ? { ...item, ...portfolioData } : item)
        );
        
        alert('Portfolio item updated successfully!');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('talent_portfolio')
          .insert([portfolioData])
          .select()
          .single();

        if (error) throw error;
        
        setPortfolioItems(prev => [data, ...prev]);
        alert('Portfolio item added successfully!');
      }

      // Reset form
      setFormData({
        project_title: '',
        project_description: '',
        project_type: '',
        collaborators: [],
        project_date: '',
        media_links: [],
        is_public: true
      });
      setShowAddForm(false);
      setEditingItem(null);

    } catch (error) {
      console.error('Error saving portfolio item:', error);
      alert('Error saving portfolio item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    
    try {
      const { error } = await supabase
        .from('talent_portfolio')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
      alert('Portfolio item deleted successfully!');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      alert('Error deleting portfolio item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      project_title: item.project_title,
      project_description: item.project_description || '',
      project_type: item.project_type || '',
      collaborators: item.collaborators || [],
      project_date: item.project_date || '',
      media_links: item.media_links || [],
      is_public: item.is_public
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const addCollaborator = () => {
    if (newCollaborator.name.trim()) {
      setFormData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, { ...newCollaborator }]
      }));
      setNewCollaborator({ name: '', social_handle: '', platform: '' });
    }
  };

  const removeCollaborator = (index) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }));
  };

  const addMediaLink = () => {
    if (newMediaLink.trim()) {
      setFormData(prev => ({
        ...prev,
        media_links: [...prev.media_links, newMediaLink]
      }));
      setNewMediaLink('');
    }
  };

  const removeMediaLink = (index) => {
    setFormData(prev => ({
      ...prev,
      media_links: prev.media_links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Portfolio & Experience
              </h1>
              <p className="text-gray-600">
                Showcase your work, collaborations, and experience to attract more opportunities
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={profile.type === 'creator' ? '/producer-dashboard' : '/talent-dashboard'}>
                <button className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </button>
              </Link>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingItem(null);
                  setFormData({
                    project_title: '',
                    project_description: '',
                    project_type: '',
                    collaborators: [],
                    project_date: '',
                    media_links: [],
                    is_public: true
                  });
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Portfolio Item
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={formData.project_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 'Scene with Studio XYZ', 'Solo Content Series'"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    {PROJECT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Date</label>
                <input
                  type="date"
                  value={formData.project_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.project_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe the project, your role, and any notable details..."
                />
              </div>

              {/* Collaborators Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Collaborators</label>
                <div className="space-y-3">
                  {formData.collaborators.map((collab, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{collab.name}</span>
                        {collab.social_handle && (
                          <span className="text-sm text-gray-600 ml-2">
                            @{collab.social_handle} ({collab.platform})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCollaborator(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newCollaborator.name}
                      onChange={(e) => setNewCollaborator(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Collaborator name"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={newCollaborator.social_handle}
                      onChange={(e) => setNewCollaborator(prev => ({ ...prev, social_handle: e.target.value }))}
                      placeholder="@username"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={newCollaborator.platform}
                      onChange={(e) => setNewCollaborator(prev => ({ ...prev, platform: e.target.value }))}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Platform...</option>
                      {SOCIAL_PLATFORMS.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addCollaborator}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Media Links Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Media Links (SFW previews/samples)</label>
                <div className="space-y-3">
                  {formData.media_links.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {link}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMediaLink(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={newMediaLink}
                      onChange={(e) => setNewMediaLink(e.target.value)}
                      placeholder="https://example.com/preview"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={addMediaLink}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <label htmlFor="is_public" className="text-sm font-medium">
                  Make this portfolio item public (visible on your profile)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  {editingItem ? 'Update Portfolio Item' : 'Add Portfolio Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Portfolio Items List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Portfolio Items</h2>
          
          {portfolioItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-4xl text-purple-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Portfolio Items Yet</h3>
              <p className="text-gray-500 mb-6">
                Start building your portfolio to showcase your experience and attract more opportunities!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Add Your First Portfolio Item
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.project_title}</h3>
                        {item.project_type && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            {item.project_type}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                      
                      {item.project_date && (
                        <p className="text-sm text-gray-600 mb-2">
                          <i className="fas fa-calendar mr-1"></i>
                          {new Date(item.project_date).toLocaleDateString()}
                        </p>
                      )}
                      
                      {item.project_description && (
                        <p className="text-gray-700 mb-3">{item.project_description}</p>
                      )}
                      
                      {item.collaborators && item.collaborators.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Collaborators: </span>
                          {item.collaborators.map((collab, index) => (
                            <span key={index} className="text-sm text-blue-600 mr-2">
                              {collab.name}
                              {collab.social_handle && ` (@${collab.social_handle})`}
                              {index < item.collaborators.length - 1 && ','}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.media_links && item.media_links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.media_links.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Preview {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        <i className="fas fa-edit mr-1"></i>Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
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
      </div>
    </div>
  );
}
