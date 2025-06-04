"use client";
import { useState } from "react";

export default function FindWork() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8 whitespace-nowrap">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent tracking-wide">
              FanGigs
            </div>
            <nav className="flex items-center space-x-4">
              <a
                href="/find-work"
                className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition"
              >
                Find Work
              </a>
              <a
                href="#"
                className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition"
              >
                Find Talent
              </a>
              <a
                href="#"
                className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition"
              >
                Agents
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="bg-[#E8967B] text-white px-4 py-2 rounded font-medium hover:opacity-90 transition"
            >
              Join
            </a>
            <a
              href="#"
              className="border-2 border-[#E8967B] text-black px-4 py-2 rounded font-medium hover:bg-[#E8967B] hover:text-white transition"
            >
              Post a Job
            </a>
            <a
              href="#"
              className="text-black font-semibold hover:text-blue-900 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Trending Tags */}
      <section className="bg-sky-100 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-black text-sm font-semibold mb-2">
            🔥 Trending Now
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Collab",
              "MILF",
              "Amateurs",
              "New Face",
              "Studio",
              "Boys Love",
              "Bisexual",
              "Trans",
              "Verified",
              "Couples",
            ].map((tag, index) => (
              <a
                key={index}
                href="#"
                className="bg-white text-black px-3 py-1 rounded-full text-sm hover:bg-blue-900 hover:text-white transition"
              >
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
            Showing <strong>3</strong> jobs in <strong>All locations</strong>
          </p>
        </div>

        {/* Filter Block */}
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

        {/* Job Listings */}
        <div className="space-y-6">
          {[
            {
              title: "Female Actress Wanted",
              producer: "Luna Studios",
              description:
                "Seeking a confident female talent for a professional studio shoot. All levels welcome.",
            },
            {
              title: "Male Actor Wanted",
              producer: "Rogue House",
              description:
                "Casting for a passionate male performer for a short role. Great pay, flexible schedule.",
            },
            {
              title: "MILF Actress Wanted (40+)",
              producer: "HotShots Media",
              description:
                "Looking for a charismatic woman 40+ to star in a premium production. Experience preferred.",
            },
          ].map((job, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-pink-700">{job.title}</h3>
              <p className="text-blue-700 underline">{job.producer}</p>
              <p className="text-gray-700 mt-1">{job.description}</p>
              <button className="mt-4 font-bold bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                View Details & Apply
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-sm text-gray-600 py-4 mt-10 border-t">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2025 FanGigs. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Use
            </a>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
