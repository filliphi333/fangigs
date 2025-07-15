'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
        About FanGigs
      </h1>

      <p className="mb-6 text-gray-700 text-lg">
        <strong>FanGigs</strong> is a professional platform connecting adult content creators with
        talents, collaborators, and job opportunities. Our mission is to empower creators and performers by
        simplifying the hiring process, offering safe networking, and fostering creative freedom.
      </p>

      <p className="mb-6 text-gray-700 text-lg">
        Whether you’re a model looking for your next shoot, a producer in need of talent, or a fan commissioning
        custom content, FanGigs helps you make the right connections with transparency, professionalism, and privacy.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">What We Offer</h2>
      <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
        <li>Job board for casting calls and gigs</li>
        <li>Creator & Talent dashboards</li>
        <li>Verified profiles and portfolios</li>
        <li>Interactive travel map and availability tracking</li>
        <li>Custom content commission system</li>
        <li>Private and public profile options</li>
        <li>Industry news and updates</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Built With You in Mind</h2>
      <p className="text-gray-700 text-lg">
        FanGigs was created to support the real needs of adult industry professionals — with tools that simplify
        logistics, expand opportunities, and prioritize safety and consent.
      </p>

      <div className="mt-10 text-center">
        <Link href="/join">
          <button className="bg-blue-700 text-white px-6 py-3 rounded text-lg font-semibold hover:bg-blue-800 transition">
            Join FanGigs Now
          </button>
        </Link>
      </div>
    </main>
  );
}
