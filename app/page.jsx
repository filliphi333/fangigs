'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JoinModal from '../components/JoinModal';
import SignInModal from '../components/SignInModal';
import NewsSection from "../components/NewsSection";
import HeroSection from "../components/HeroSection"; // Import HeroSection
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';   // ← add this
import CreatorMapSection from "../components/CreatorMapSection.jsx";

export default function Home() {
  const [isJoinOpen, setJoinOpen] = useState(false);
  const [isSignInOpen, setSignInOpen] = useState(false);
  const router = useRouter();
  const [trendingJobs, setTrendingJobs] = useState([]);

  useEffect(() => {
  const fetchTrending = async () => {
    const { data, error } = await supabase
      .from('job_postings')
      .select('id, slug, title, location, pay')          // pick only what we need
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Trending jobs error:', error);
    } else {
      setTrendingJobs(data);
    }
  };

  fetchTrending();
}, []);

  function scroll(direction) {
    const container = document.getElementById('roleScroll');
    const amount = 300;
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />



      {/* Scrollable Role Cards */}
    <section className="py-12 px-4 bg-gray-50 relative">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6">Choose Your Role</h2>

    <div className="relative">
      {/* Left Arrow (Mobile) */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow md:hidden"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow (Mobile) */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow md:hidden"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Left Scroll Button (Desktop) */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 border rounded-full p-2 shadow hidden md:flex"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scrollable Role Cards */}
      <div
        id="roleScroll"
        className="flex overflow-x-auto space-x-6 pb-4 px-1 no-scrollbar scroll-smooth"
      >
        {[{
          title: 'For Models',
          desc: 'Apply to verified casting calls and work with content creators.',
          link: '/roles/models',
          image: '/images/models.jpg'
        }, {
          title: 'For Content Creators',
          desc: 'Post job listings or find collaborators.',
          link: '/roles/creators',
          image: '/images/creators.jpg'
        }, {
          title: 'For Camerapeople',
          desc: 'Join sets and shoot high-quality scenes.',
          link: '/roles/camerapeople',
          image: '/images/camera.jpg'
        }, {
          title: 'For Editors',
          desc: 'Edit scenes and trailers.',
          link: '/roles/editors',
          image: '/images/editors.jpg'
          }, {
          title: 'For Studios',
          desc: 'Find fresh faces and post casting calls on a clean, professional platform.',
          link: '/roles/studios',
          image: '/images/studio.jpg'
        }].map((role, index) => (
          <Link
            key={index}
            href={role.link}
            className="min-w-[260px] max-w-[260px] bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden border border-gray-200"
          >
            <Image
              src={role.image}
              alt={role.title}
              width={300}
              height={160}
              className="w-full h-40 object-cover object-center"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Right Scroll Button (Desktop) */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 border rounded-full p-2 shadow hidden md:flex"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</section>







  <CreatorMapSection />

      {/* Trending Roles */}
      <section className="bg-pink-500 w-full py-6 px-4">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-white text-2xl font-bold mb-4">Trending Roles</h2>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {trendingJobs.length === 0 && (
        <p className="text-white">No jobs yet — check back soon!</p>
      )}

      {trendingJobs.map((job) => (
        <Link
          key={job.id}
          href={`/job/${job.slug}`}
          className="bg-white p-4 rounded shadow hover:shadow-lg transition text-black"
        >
          <p className="font-semibold">{job.title}</p>
          {job.location && <p className="text-sm">{job.location}</p>}
          {job.pay && <p className="text-sm">{job.pay}</p>}
        </Link>
      ))}
    </div>

    <div className="text-center">
      <Link href="/find-work">
        <button className="bg-pink-700 text-white font-semibold px-6 py-2 rounded hover:bg-pink-800 transition">
          Find More Jobs
        </button>
      </Link>
    </div>
  </div>
</section>


      <NewsSection />

      {/* Join & Sign In Modals */}
      <JoinModal isOpen={isJoinOpen} onClose={() => setJoinOpen(false)} />
      <SignInModal isOpen={isSignInOpen} onClose={() => setSignInOpen(false)} />
    </main>
  );
}
