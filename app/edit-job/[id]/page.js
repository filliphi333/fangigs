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
  const { id } = params;          // ✅ This is all you need
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    pay: "",
    isPayConfidential: false,
    expiration: "",
    tags: [],
  });

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        return;
      }

      setForm({
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        pay: data.pay || "",
        isPayConfidential: data.is_pay_confidential || false,
        expiration: data.expiration || "",
        tags: data.tags || [],
      });
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    const { error } = await supabase
      .from("job_postings")
      .update({
        title: form.title,
        description: form.description,
        location: form.location,
        pay: form.isPayConfidential ? null : form.pay,
        is_pay_confidential: form.isPayConfidential,
        expiration: form.expiration,
        tags: form.tags,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update job.");
    } else {
      alert("Job updated successfully!");
      router.push("/producer-dashboard");
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Job Posting</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Job Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div className="flex items-center space-x-2">
          <input
            name="pay"
            placeholder="Pay Amount"
            value={form.pay}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            disabled={form.isPayConfidential}
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPayConfidential"
              checked={form.isPayConfidential}
              onChange={handleChange}
            />
            <span>Confidential</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Expiration Date</label>
          <input
            type="date"
            name="expiration"
            value={form.expiration}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Tags</label>
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full border transition text-sm ${form.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {tag} {form.tags.includes(tag) && <span className="ml-1">&times;</span>}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
