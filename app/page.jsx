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
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto relative">
          <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 border rounded-full p-2 shadow hidden md:block">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div id="roleScroll" className="flex overflow-x-auto space-x-6 pb-4 no-scrollbar scroll-smooth">
            {[{
              title: 'For Models', desc: 'Apply to verified casting calls and work with content creators.', link: '/roles/models', image: '/images/models.jpg'
            }, {
              title: 'For Content Creators', desc: 'Post job listings or find collaborators.', link: '/roles/creators', image: '/images/creators.jpg'
            }, {
              title: 'For Camerapeople', desc: 'Join sets and shoot high-quality scenes.', link: '/roles/camerapeople', image: '/images/camera.jpg'
            }, {
              title: 'For Editors', desc: 'Edit scenes and trailers.', link: '/roles/editors', image: '/images/editors.jpg'
            }].map((role, index) => (
              <a key={index} href={role.link} className="min-w-[250px] bg-white rounded-xl shadow hover:text-blue-700 hover:shadow-lg transition overflow-hidden">
                <Image src={role.image} alt={role.title} width={300} height={160} className="w-full h-40 object-cover object-top" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.desc}</p>
                </div>
              </a>
            ))}
          </div>

          <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 border rounded-full p-2 shadow hidden md:block">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Signup Neon Section */}
      <section className="relative h-[400px]">
        <Image src="/images/neon-sign.jpg" alt="Neon Sign" fill className="object-cover object-center brightness-[0.5]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-8 max-w-md w-full text-center shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the FanGigs Network</h2>
            <p className="text-gray-600 mb-4">Get discovered. Get booked. Get paid.</p>
            <button onClick={() => setJoinOpen(true)} className="bg-[#E8967B] text-white px-6 py-2 rounded font-semibold hover:opacity-90 transition">
              Create Your Free Profile
            </button>
          </div>
        </div>
      </section>

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
