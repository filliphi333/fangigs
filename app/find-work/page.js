"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function FindWork() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .gte("expiration_date", new Date().toISOString()) // show only non-expired jobs
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch jobs:", error);
      } else {
        setJobs(data);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Trending Tags */}
      <section className="bg-sky-100 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-black text-sm font-semibold mb-2">🔥 Trending Now</h2>
          <div className="flex flex-wrap gap-2">
            {["Collab", "MILF", "Amateurs", "New Face", "Studio", "Boys Love", "Bisexual", "Trans", "Verified", "Couples"].map((tag, index) => (
              <a key={index} href="#" className="bg-white text-black px-3 py-1 rounded-full text-sm hover:bg-blue-900 hover:text-white transition">
                {tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + Results */}
      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-grow">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 font-bold"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="mr-2">🔍</span> Filter
          </button>
          <p className="text-gray-700 text-sm">
            {loading
              ? "Loading jobs..."
              : jobs.length > 0
              ? `Showing ${jobs.length} job${jobs.length !== 1 ? "s" : ""} in All locations`
              : "No jobs available at the moment."}
          </p>
        </div>

        {filtersOpen && (
          <div className="border border-gray-300 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Location"
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
              <select className="border border-gray-300 rounded px-3 py-2 w-full">
                <option>Role Type</option>
                <option>Talent</option>
                <option>Content Creator</option>
                <option>Studio</option>
              </select>
              <select className="border border-gray-300 rounded px-3 py-2 w-full">
                <option>Category</option>
                <option>Solo</option>
                <option>Boy/Girl</option>
                <option>Group</option>
                <option>LGBT+</option>
              </select>
            </div>
            <button className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 font-semibold">
              Apply Filters
            </button>
          </div>
        )}

        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-pink-700">{job.title}</h3>
              <p className="text-gray-700 mt-1">{job.description}</p>
              {job.location && <p className="text-sm text-gray-500 mt-1">📍 {job.location}</p>}
              <Link href={`/job/${job.slug}`}>
                <button className="mt-4 font-bold bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  View Details & Apply
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
