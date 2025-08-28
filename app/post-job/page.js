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
  });

  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});

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

    if (!form.isPayConfidential && form.pay && !form.pay.match(/^\$?\d+(\.\d{2})?$/)) {
      newErrors.pay = "Please enter a valid pay amount";
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
        status: 'pending' // Jobs need approval
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

  return (
    <>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              "Post Job"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your job will be reviewed by our team before going live</p>
        </div>
      </main>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setSignInModalOpen(false)}
        openJoinModal={openJoinModal}
      />
      
      <JoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setJoinModalOpen(false)}
      />
    </>
  );
}