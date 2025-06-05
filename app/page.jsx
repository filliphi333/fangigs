'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import JoinModal from '../components/JoinModal';

export default function Home() {
  const [isJoinOpen, setJoinOpen] = useState(false);

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
            <button onClick={() => setJoinOpen(true)} className="bg-[#E8967B] text-white px-4 py-2 rounded font-medium hover:opacity-90 transition">Join</button>
            <a href="#" className="border-2 border-[#E8967B] text-black px-4 py-2 rounded font-medium hover:bg-[#E8967B] hover:text-white transition">Post a Job</a>
            <a href="#" className="text-black font-semibold hover:text-blue-900 transition">Sign In</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="my-10 px-4">
        <div className="relative max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/images/hero-studio.jpg"
            alt="Studio scene"
            width={1200}
            height={400}
            className="w-full h-[380px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start px-10">
            <h1 className="text-white text-4xl font-bold mb-2">Start your creator journey with confidence</h1>
            <p className="text-white text-lg max-w-xl">
              On FanGigs, connect with real content creators and verified jobs in adult entertainment.
            </p>
            <button
              onClick={() => setJoinOpen(true)}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition"
            >
              Join Now
            </button>
          </div>
        </div>
      </section>

      {/* Scrollable Role Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto relative">
          <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 border rounded-full p-2 shadow hidden md:block">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div id="roleScroll" className="flex overflow-x-auto space-x-6 pb-4 no-scrollbar scroll-smooth">
            {[
              { title: 'For Models', desc: 'Apply to verified casting calls and work with content creators.', link: '/roles/models', image: '/images/models.jpg' },
              { title: 'For Content Creators', desc: 'Post job listings or find collaborators.', link: '/roles/creators', image: '/images/creators.jpg' },
              { title: 'For Camerapeople', desc: 'Join sets and shoot high-quality scenes.', link: '/roles/camerapeople', image: '/images/camera.jpg' },
              { title: 'For Editors', desc: 'Edit scenes and trailers.', link: '/roles/editors', image: '/images/editors.jpg' }
            ].map((role, index) => (
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
        <Image
          src="/images/neon-sign.jpg"
          alt="Neon Sign"
          fill
          className="object-cover object-center brightness-[0.5]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-8 max-w-md w-full text-center shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the FanGigs Network</h2>
            <p className="text-gray-600 mb-4">Get discovered. Get booked. Get paid.</p>
            <button
              onClick={() => setJoinOpen(true)}
              className="bg-[#E8967B] text-white px-6 py-2 rounded font-semibold hover:opacity-90 transition"
            >
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
            <div className="bg-white p-4 rounded shadow text-black">Female Model for Beach Shoot – Miami, FL – $800/day</div>
            <div className="bg-white p-4 rounded shadow text-black">OnlyFans Videographer – Los Angeles – $500/session</div>
            <div className="bg-white p-4 rounded shadow text-black">LGBTQ Male Model – NYC – $250/hr</div>
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

      {/* Industry News */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Industry News</h2>

        {/* Featured Article */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="md:w-1/2 h-60 bg-gray-300 rounded-lg overflow-hidden">
            <Image
              src="/images/editors.jpg"
              alt="Featured News"
              width={600}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">Industry Changes in 2025</h3>
            <p className="text-gray-700">
              Learn how the adult creator economy is evolving and where the industry is heading this year.
            </p>
          </div>
        </div>

        {/* More News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold mb-2">News Title {n}</h4>
              <p className="text-sm text-gray-600">Brief description or teaser of the article.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Modal */}
      <JoinModal isOpen={isJoinOpen} onClose={() => setJoinOpen(false)} />
    </main>
  );
}
