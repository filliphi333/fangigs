
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import PopupAnalytics from './PopupAnalytics';

const PopupManager = () => {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    target_audience: 'all',
    region: '',
    start_date: '',
    end_date: '',
    is_active: true,
    priority: 1,
    button_text: '',
    button_url: '',
    background_color: '#3B82F6',
    text_color: '#FFFFFF'
  });

  const popupTypes = [
    { value: 'announcement', label: 'Announcement', icon: 'fas fa-bullhorn' },
    { value: 'maintenance', label: 'Maintenance', icon: 'fas fa-tools' },
    { value: 'holiday', label: 'Holiday', icon: 'fas fa-gift' },
    { value: 'feature', label: 'New Feature', icon: 'fas fa-star' },
    { value: 'warning', label: 'Warning', icon: 'fas fa-exclamation-triangle' },
    { value: 'promotion', label: 'Promotion', icon: 'fas fa-percent' }
  ];

  const audienceTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'logged-out', label: 'Logged Out Only' },
    { value: 'new-users', label: 'New Users (< 30 days)' },
    { value: 'talents', label: 'Talents Only' },
    { value: 'creators', label: 'Creators Only' },
    { value: 'region-specific', label: 'Region Specific' }
  ];

  const fetchPopups = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_popups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPopups(data || []);
    } catch (err) {
      setError('Failed to fetch popups: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopups();
  }, [fetchPopups]);

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      target_audience: 'all',
      region: '',
      start_date: '',
      end_date: '',
      is_active: true,
      priority: 1,
      button_text: '',
      button_url: '',
      background_color: '#3B82F6',
      text_color: '#FFFFFF'
    });
    setEditingPopup(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        throw new Error('End date must be after start date');
      }

      if (editingPopup) {
        const { error } = await supabase
          .from('admin_popups')
          .update(formData)
          .eq('id', editingPopup.id);
        
        if (error) throw error;
        showMessage('Popup updated successfully!');
      } else {
        const { error } = await supabase
          .from('admin_popups')
          .insert([formData]);
        
        if (error) throw error;
        showMessage('Popup created successfully!');
      }

      resetForm();
      fetchPopups();
    } catch (err) {
      showMessage('Failed to save popup: ' + err.message, true);
    }
  };

  const handleEdit = (popup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title || '',
      content: popup.content || '',
      type: popup.type || 'announcement',
      target_audience: popup.target_audience || 'all',
      region: popup.region || '',
      start_date: popup.start_date ? new Date(popup.start_date).toISOString().slice(0, 16) : '',
      end_date: popup.end_date ? new Date(popup.end_date).toISOString().slice(0, 16) : '',
      is_active: popup.is_active !== false,
      priority: popup.priority || 1,
      button_text: popup.button_text || '',
      button_url: popup.button_url || '',
      background_color: popup.background_color || '#3B82F6',
      text_color: popup.text_color || '#FFFFFF'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;

    try {
      const { error } = await supabase
        .from('admin_popups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('Popup deleted successfully!');
      fetchPopups();
    } catch (err) {
      showMessage('Failed to delete popup: ' + err.message, true);
    }
  };

  const handleToggleActive = async (popup) => {
    try {
      const { error } = await supabase
        .from('admin_popups')
        .update({ is_active: !popup.is_active })
        .eq('id', popup.id);

      if (error) throw error;
      showMessage(`Popup ${!popup.is_active ? 'activated' : 'deactivated'} successfully!`);
      fetchPopups();
    } catch (err) {
      showMessage('Failed to update popup status: ' + err.message, true);
    }
  };

  const getStatusBadge = (popup) => {
    const now = new Date();
    const start = new Date(popup.start_date);
    const end = new Date(popup.end_date);

    if (!popup.is_active) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Inactive</span>;
    }
    if (now < start) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">Scheduled</span>;
    }
    if (now > end) {
      return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">Expired</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Active</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="fas fa-popup text-blue-600 mr-3"></i>
            Popup Management
          </h2>
          <p className="text-gray-600">Create and manage site-wide popup notifications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Popup
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      {/* Popup Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPopup ? 'Edit Popup' : 'Create New Popup'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {popupTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      value={formData.target_audience}
                      onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {audienceTypes.map(audience => (
                        <option key={audience.value} value={audience.value}>{audience.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Low (1)</option>
                      <option value={2}>Normal (2)</option>
                      <option value={3}>High (3)</option>
                      <option value={4}>Critical (4)</option>
                    </select>
                  </div>
                </div>

                {formData.target_audience === 'region-specific' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      placeholder="e.g., US, UK, CA"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text (Optional)</label>
                    <input
                      type="text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                      placeholder="e.g., Learn More"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.button_url}
                      onChange={(e) => setFormData({...formData, button_url: e.target.value})}
                      placeholder="https://example.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                      className="w-full h-12 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                      className="w-full h-12 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (popup will be shown when conditions are met)
                  </label>
                </div>

                <div className="flex space-x-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    {editingPopup ? 'Update Popup' : 'Create Popup'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Popups List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Existing Popups</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading popups...</p>
          </div>
        ) : popups.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-popup text-gray-300 text-4xl mb-4"></i>
            <p className="text-gray-600">No popups created yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {popups.map((popup) => (
              <div key={popup.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{popup.title}</h4>
                      {getStatusBadge(popup)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        popup.priority >= 4 ? 'bg-red-100 text-red-600' :
                        popup.priority >= 3 ? 'bg-orange-100 text-orange-600' :
                        popup.priority >= 2 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        Priority {popup.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{popup.content}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <i className="fas fa-users mr-1"></i>
                        {audienceTypes.find(a => a.value === popup.target_audience)?.label}
                      </span>
                      <span className="flex items-center">
                        <i className="fas fa-calendar mr-1"></i>
                        {new Date(popup.start_date).toLocaleDateString()} - {new Date(popup.end_date).toLocaleDateString()}
                      </span>
                      {popup.region && (
                        <span className="flex items-center">
                          <i className="fas fa-globe mr-1"></i>
                          {popup.region}
                        </span>
                      )}
                    </div>
                    <PopupAnalytics popupId={popup.id} />
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(popup)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        popup.is_active 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {popup.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(popup)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(popup.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupManager;
