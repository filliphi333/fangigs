"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SignInModal from "../../components/SignInModal";
import JoinModal from "../../components/JoinModal";

export default function PostJob() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    pay: "",
    isPayConfidential: false,
    expiration: "",
    tags: [],
    jobType: "one-time", // Default value
    urgency: "normal",   // Default value
  });

  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const predefinedTags = [
    "Straight", "Gay for Pay", "Collab", "Onlyfans", "Athletic", "Stud",
    "Lesbian", "Orgy", "Gangbang", "Bareback", "Blonde", "Redhead",
    "Brunette", "Asian", "Black", "MILF", "Outdoor", "Amateur", "Gay", "Bissexual", "DILF", "Chubby", "Feet", "Anal", "DP", "BDSM", "Cameraman", "Editor",
  ];

  const router = useRouter();

  // Set default expiration date (30 days from now)
  useEffect(() => {
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 30);
    setForm(prev => ({
      ...prev,
      expiration: defaultExpiration.toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setSignInModalOpen(true);
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, []);

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (form.description.length < 50) {
      newErrors.description = "Description should be at least 50 characters";
    }

    if (!form.isPayConfidential && form.pay && !form.pay.match(/^\$?([1-9]\d*(\.\d{1,2})?|0(\.\d{1,2})?)$/)) {
      newErrors.pay = "Please enter a valid pay amount (e.g., $50 or 50.75)";
    }

    if (!form.expiration) {
      newErrors.expiration = "Expiration date is required";
    } else {
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "pay") {
      // Remove any existing non-numeric characters except dot
      const numericValue = value.replace(/[^0-9.]/g, "");

      setForm((prev) => ({
        ...prev,
        [name]: numericValue ? `$${numericValue}` : "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setSignInModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      const slug = slugify(form.title);

      const { error } = await supabase.from("job_postings").insert([{
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim() || null,
        pay: form.isPayConfidential ? null : form.pay.replace(/^\$/, ""),
        is_pay_confidential: form.isPayConfidential,
        expiration: form.expiration,
        tags: form.tags,
        slug: slug,
        creator_id: user.id,
        status: 'pending', // Jobs need approval
        job_type: form.jobType,
        urgency: form.urgency,
      }]);

      if (error) {
        throw error;
      }

      // Reset form
      setForm({
        title: "",
        description: "",
        location: "",
        pay: "",
        isPayConfidential: false,
        expiration: "",
        tags: [],
        jobType: "one-time",
        urgency: "normal",
      });

      // Redirect to dashboard with success message
      localStorage.setItem('job_posted_success', 'true');
      router.push('/producer-dashboard');

    } catch (error) {
      console.error('Error posting job:', error);
      alert("Error posting job: " + (error.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  const openJoinModal = () => {
    setSignInModalOpen(false);
    setJoinModalOpen(true);
  };

  const openSignInModal = () => {
    setJoinModalOpen(false);
    setSignInModalOpen(true);
  };

  const handleModalClose = () => {
    // If user closes modal without signing in, redirect to home
    if (!user) {
      router.push('/');
    } else {
      setSignInModalOpen(false);
    }
  };

  const handleJoinModalClose = () => {
    // If user closes join modal without signing in, redirect to home
    if (!user) {
      router.push('/');
    } else {
      setJoinModalOpen(false);
    }
  };

  return (
    <>
      {showPreview && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">Job Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold mb-2">{form.title || 'No Title'}</h1>
              <p className="text-gray-600 mb-4">Posted by: {user?.email || 'User not logged in'}</p>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{form.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Location</h3>
                  <p className="text-gray-800">{form.location || 'Not Specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Pay</h3>
                  <p className="text-gray-800">
                    {form.isPayConfidential ? 'Confidential' : form.pay || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Job Type</h3>
                  <p className="text-gray-800 capitalize">{form.jobType}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Urgency</h3>
                  <p className="text-gray-800 capitalize">{form.urgency}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Expires On</h3>
                  <p className="text-gray-800">{form.expiration || 'Not Specified'}</p>
                </div>
              </div>
              {form.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.title || !form.description}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <i className="fas fa-paper-plane mr-2"></i>
                )}
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
          <p className="text-gray-600">Create a job posting to find the perfect talent for your project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              id="title"
              name="title"
              placeholder="e.g., Seeking Professional Model for Photo Shoot"
              value={form.title}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description * (minimum 50 characters)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the project, requirements, expectations, and any other relevant details..."
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              <p className="text-gray-500 text-sm">{form.description.length} characters</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="location"
              name="location"
              placeholder="e.g., Los Angeles, CA or Remote"
              value={form.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Job Type and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="one-time">One-time Project</option>
                <option value="ongoing">Ongoing Work</option>
                <option value="collab">Collaboration</option>
              </select>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                Urgency Level
              </label>
              <select
                id="urgency"
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="flexible">Flexible Timeline</option>
                <option value="normal">Normal Priority</option>
                <option value="urgent">Urgent (ASAP)</option>
              </select>
            </div>
          </div>

          {/* Pay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay</label>
            <div className="flex items-center space-x-3">
              <input
                name="pay"
                placeholder="e.g., $500"
                value={form.pay}
                onChange={handleChange}
                disabled={form.isPayConfidential}
                className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  form.isPayConfidential ? 'bg-gray-100 text-gray-500' : 'border-gray-300'
                } ${errors.pay ? 'border-red-500' : ''}`}
              />
              <label className="flex items-center space-x-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  name="isPayConfidential"
                  checked={form.isPayConfidential}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Confidential</span>
              </label>
            </div>
            {errors.pay && <p className="text-red-500 text-sm mt-1">{errors.pay}</p>}
          </div>

          {/* Expiration Date */}
          <div>
            <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
              Job Expiration Date *
            </label>
            <input
              type="date"
              id="expiration"
              name="expiration"
              value={form.expiration}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expiration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.expiration && <p className="text-red-500 text-sm mt-1">{errors.expiration}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tags (helps talent find your job)
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-gray-300 rounded-lg">
              {predefinedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full border transition text-sm ${
                    form.tags.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tag} {form.tags.includes(tag) && <span className="ml-1">×</span>}
                </button>
              ))}
            </div>
            {form.tags.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {form.tags.join(", ")}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!form.title || !form.description}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-eye mr-2"></i>
                Preview Job
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Job...
                  </span>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Post Job
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your job will be reviewed by our team before going live</p>
        </div>
      </main>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleModalClose}
        openJoinModal={openJoinModal}
      />

      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={handleJoinModalClose}
      />
    </>
  );
}