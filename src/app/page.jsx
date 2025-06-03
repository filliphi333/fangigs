'use client';
import { useState } from 'react';
import JoinModal from '../components/JoinModal';

export default function Home() {const [isJoinOpen, setJoinOpen] = useState(false);

  function scroll(direction) {
    const container = document.getElementById('roleScroll');
    const amount = 300;
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8 whitespace-nowrap">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent tracking-wide">
              FANGIGS
            </div>
            <nav className="flex items-center space-x-4">
              <a href="#" className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition">Find Work</a>
              <a href="#" className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition">Hire Models</a>
              <a href="#" className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition">Agents</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <a onClick={() => setJoinOpen(true)} className="cursor-pointer bg-[#E8967B] text-white px-4 py-2 rounded font-medium hover:opacity-90 transition">
  Join
</a>

            <a href="#" className="border-2 border-[#E8967B] text-black px-4 py-2 rounded font-medium hover:bg-[#E8967B] hover:text-white transition">Post a Job</a>
            <a href="#" className="text-black font-semibold hover:text-blue-900 transition">Sign In</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="my-10 px-4">
        <div className="relative max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <img
            src="/images/hero-studio.jpg"
            alt="Studio scene"
            className="w-full h-[380px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start px-10">
            <h1 className="text-white text-4xl font-bold mb-2">Start your creator journey with confidence</h1>
            <p className="text-white text-lg max-w-xl">
              On FanGigs, connect with real content creators and verified jobs in adult entertainment.
            </p>
            <a
              onClick={() => setJoinOpen(true)}
              className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition"
            >
              Join Now
            </a>
          </div>
        </div>
      </section>

      {/* Scrollable Role Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto relative">
          <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border rounded-full p-2 shadow hidden md:block">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div id="roleScroll" className="flex overflow-x-auto space-x-6 pb-4 no-scrollbar scroll-smooth">
            {[
              {
                title: 'For Models',
                desc: 'Apply to verified casting calls and work with content creators.',
                link: '/roles/models',
                image: '/images/models.jpg'
              },
              {
                title: 'For Content Creators',
                desc: 'Post job listings or find reliable collaborators.',
                link: '/roles/creators',
                image: '/images/creators.jpg'
              },
              {
                title: 'For Camerapeople',
                desc: 'Join creator sets and shoot high-quality scenes.',
                link: '/roles/camerapeople',
                image: '/images/camera.jpg'
              },
              {
                title: 'For Editors',
                desc: 'Edit scenes, trailers, and handle post-production.',
                link: '/roles/editors',
                image: '/images/editors.jpg'
              }
            ].map((role, index) => (
              <a key={index} href={role.link} className="min-w-[250px] bg-white rounded-xl shadow hover:text-blue-700 hover:shadow-lg transition overflow-hidden">
                <img src={role.image} alt={role.title} className="w-full h-40 object-cover object-top" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.desc}</p>
                </div>
              </a>
            ))}
          </div>

          <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border rounded-full p-2 shadow hidden md:block">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
      <JoinModal isOpen={isJoinOpen} onClose={() => setJoinOpen(false)} />
    </main>
  );
}
