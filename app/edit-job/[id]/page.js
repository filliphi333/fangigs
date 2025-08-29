
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const predefinedTags = [
  "Straight", "Gay for Pay", "Collab", "Onlyfans", "Athletic", "Stud",
  "Lesbian", "Orgy", "Gangbang", "Bareback", "Blonde", "Redhead",
  "Brunette", "Asian", "Black", "MILF", "Outdoor", "Amateur",
  "Gay", "Bissexual", "DILF", "Chubby", "Feet", "Anal", "DP", "BDSM",
  "Cameraman", "Editor"
];

export default function EditJob({ params }) {
  const { id } = params;
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    pay: "",
    isPayConfidential: false,
    expiration: "",
    tags: [],
    urgency: "normal",
    jobType: "one-time",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_postings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setForm({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          pay: data.pay || "",
          isPayConfidential: data.is_pay_confidential || false,
          expiration: data.expiration || "",
          tags: data.tags || [],
          urgency: data.urgency || "normal",
          jobType: data.job_type || "one-time",
        });
      } catch (error) {
        console.error("Error fetching job:", error);
        showNotification("Error loading job data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (form.title.length < 10) {
      newErrors.title = "Job title must be at least 10 characters";
    }

    if (!form.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (form.description.length < 50) {
      newErrors.description = "Job description must be at least 50 characters";
    }

    if (!form.isPayConfidential && form.pay && isNaN(Number(form.pay))) {
      newErrors.pay = "Pay must be a valid number";
    }

    if (form.expiration) {
      const expirationDate = new Date(form.expiration);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expirationDate < today) {
        newErrors.expiration = "Expiration date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("Please fix the errors below", "error");
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("job_postings")
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim() || null,
          pay: form.isPayConfidential ? null : form.pay || null,
          is_pay_confidential: form.isPayConfidential,
          expiration: form.expiration || null,
          tags: form.tags,
          urgency: form.urgency,
          job_type: form.jobType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      showNotification("Job updated successfully!", "success");
      setTimeout(() => {
        router.push("/producer-dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error updating job:", error);
      showNotification("Failed to update job. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fas ${
              notification.type === 'success' ? 'fa-check-circle' :
              notification.type === 'error' ? 'fa-exclamation-triangle' :
              'fa-info-circle'
            }`}></i>
            {notification.message}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
              <i className="fas fa-edit text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Job Posting</h1>
          </div>
          <p className="text-gray-600">Update your job posting details below. All changes will be saved immediately.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-600"></i>
              Basic Information
            </h2>
            
            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  name="title"
                  placeholder="e.g., Content Creator for Adult Film Production"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full p-4 border-2 rounded-lg transition-colors ${
                    errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Provide a detailed description of the job, requirements, and expectations..."
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full p-4 border-2 rounded-lg transition-colors resize-none ${
                    errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  {form.description.length}/500 characters (minimum 50 required)
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  name="location"
                  placeholder="e.g., Los Angeles, CA or Remote"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Job Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fas fa-cog text-purple-600"></i>
              Job Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="one-time">One-time Project</option>
                  <option value="ongoing">Ongoing Work</option>
                  <option value="collab">Collaboration</option>
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={form.urgency}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="flexible">Flexible Timeline</option>
                  <option value="normal">Normal Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compensation & Timing */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fas fa-dollar-sign text-green-600"></i>
              Compensation & Timing
            </h2>

            <div className="space-y-6">
              {/* Pay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Amount
                </label>
                <div className="flex items-center gap-4">
                  <input
                    name="pay"
                    placeholder="e.g., 500"
                    value={form.pay}
                    onChange={handleChange}
                    disabled={form.isPayConfidential}
                    className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                      form.isPayConfidential ? 'bg-gray-100 border-gray-200' : 
                      errors.pay ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none`}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isPayConfidential"
                      checked={form.isPayConfidential}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Keep Confidential</span>
                  </label>
                </div>
                {errors.pay && <p className="text-red-500 text-sm mt-1">{errors.pay}</p>}
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Expiration Date
                </label>
                <input
                  type="date"
                  name="expiration"
                  value={form.expiration}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-4 border-2 rounded-lg transition-colors ${
                    errors.expiration ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none`}
                />
                {errors.expiration && <p className="text-red-500 text-sm mt-1">{errors.expiration}</p>}
                <p className="text-gray-500 text-sm mt-1">Leave blank for no expiration</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fas fa-tags text-indigo-600"></i>
              Tags ({form.tags.length} selected)
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {predefinedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                    form.tags.includes(tag)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {tag}
                  {form.tags.includes(tag) && <span className="ml-1">&times;</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                type="button"
                onClick={() => router.push("/producer-dashboard")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
