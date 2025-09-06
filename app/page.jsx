'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JoinModal from '../components/JoinModal';
import SignInModal from '../components/SignInModal';
import NewsSection from "../components/NewsSection";
import HeroSection from "../components/HeroSection";
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import CreatorMapSection from "../components/CreatorMapSection.jsx";
import SitePopup from '../components/SitePopup';

export default function Home() {
  const [isJoinOpen, setJoinOpen] = useState(false);
  const [isSignInOpen, setSignInOpen] = useState(false);
  const router = useRouter();
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch trending jobs
        const today = new Date().toISOString().split('T')[0];
        const { data: jobsData, error: jobsError } = await supabase
          .from('job_postings')
          .select('id, slug, title, location, pay, urgency, job_type')
          .eq('is_active', true)
          .eq('status', 'approved')
          .or(`expiration.is.null,expiration.gte.${today}`)
          .order('created_at', { ascending: false })
          .limit(6);

        if (jobsError) throw jobsError;
        setTrendingJobs(jobsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function scroll(direction) {
    const container = document.getElementById('roleScroll');
    const amount = 300;
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  const roleCards = [
    {
      title: 'For Models',
      desc: 'Apply to verified casting calls and work with content creators.',
      link: '/roles/models',
      image: '/images/models.jpg',
      icon: 'fas fa-camera',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'For Content Creators',
      desc: 'Post job listings or find collaborators.',
      link: '/roles/creators',
      image: '/images/creators.jpg',
      icon: 'fas fa-video',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'For Camerapeople',
      desc: 'Join sets and shoot high-quality scenes.',
      link: '/roles/camerapeople',
      image: '/images/camera.jpg',
      icon: 'fas fa-film',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'For Editors',
      desc: 'Edit scenes and trailers.',
      link: '/roles/editors',
      image: '/images/editors.jpg',
      icon: 'fas fa-cut',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'For Studios',
      desc: 'Find fresh faces and post casting calls on a clean, professional platform.',
      link: '/roles/studios',
      image: '/images/studio.jpg',
      icon: 'fas fa-building',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection setJoinOpen={setJoinOpen} setSignInOpen={setSignInOpen} />

      {/* Enhanced Role Cards Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals already growing their careers on FanGigs
            </p>
          </div>

          <div className="relative">
            {/* Mobile scroll buttons */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg md:hidden hover:bg-white transition-all"
              aria-label="Scroll left"
            >
              <i className="fas fa-chevron-left text-gray-600"></i>
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg md:hidden hover:bg-white transition-all"
              aria-label="Scroll right"
            >
              <i className="fas fa-chevron-right text-gray-600"></i>
            </button>

            {/* Desktop scroll buttons */}
            <button
              onClick={() => scroll('left')}
              className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hidden md:flex hover:bg-white transition-all"
              aria-label="Scroll left"
            >
              <i className="fas fa-chevron-left text-gray-600"></i>
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hidden md:flex hover:bg-white transition-all"
              aria-label="Scroll right"
            >
              <i className="fas fa-chevron-right text-gray-600"></i>
            </button>

            {/* Role cards */}
            <div
              id="roleScroll"
              className="flex overflow-x-auto space-x-6 pb-4 px-4 no-scrollbar scroll-smooth"
            >
              {roleCards.map((role, index) => (
                <Link
                  key={index}
                  href={role.link}
                  className="group min-w-[300px] max-w-[300px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 transform hover:scale-105"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={role.image}
                      alt={role.title}
                      width={300}
                      height={192}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${role.gradient} opacity-80`}></div>
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <i className={`${role.icon} text-white text-xl`}></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{role.desc}</p>
                    <div className="flex items-center text-purple-600 font-semibold">
                      Learn More
                      <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator Map Section */}
      <CreatorMapSection />

      {/* Enhanced Trending Jobs Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
              <i className="fas fa-fire mr-3"></i>
              Trending Opportunities
            </h2>
            <p className="text-pink-100 text-lg">
              Discover the hottest jobs posted by verified creators and studios
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-3"></div>
                  <div className="h-3 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/20 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : trendingJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
                <i className="fas fa-briefcase text-white/60 text-4xl mb-4"></i>
                <p className="text-white text-lg mb-4">No jobs available yet</p>
                <p className="text-pink-100">Be the first to post an opportunity!</p>
                <Link
                  href="/post-job"
                  className="inline-block mt-4 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Post First Job
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {trendingJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/job/${job.slug}`}
                    className="group bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors leading-tight">
                        {job.title}
                      </h3>
                      {job.urgency === 'urgent' && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          URGENT
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {job.location && (
                        <div className="flex items-center text-pink-100">
                          <i className="fas fa-map-marker-alt mr-2 text-sm"></i>
                          <span className="text-sm">{job.location}</span>
                        </div>
                      )}
                      {job.pay && (
                        <div className="flex items-center text-pink-100">
                          <i className="fas fa-dollar-sign mr-2 text-sm"></i>
                          <span className="text-sm font-medium">{job.pay}</span>
                        </div>
                      )}
                      {job.job_type && (
                        <div className="flex items-center text-pink-100">
                          <i className="fas fa-tag mr-2 text-sm"></i>
                          <span className="text-sm capitalize">{job.job_type.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-yellow-300 font-semibold text-sm">
                      View Details
                      <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Link href="/find-work">
                  <button className="bg-white text-purple-600 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                    <i className="fas fa-search mr-2"></i>
                    Explore All Jobs
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join the professional platform that's changing how the adult content industry connects and collaborates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setJoinOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl"
            >
              <i className="fas fa-user-plus mr-2"></i>
              Join FanGigs Today
            </button>
            <button
              onClick={() => setSignInOpen(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Industry News Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <i className="fas fa-newspaper text-blue-600 mr-3"></i>
              Industry News & Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay informed with the latest trends, regulations, and opportunities in the adult content industry
            </p>
          </div>

          {/* News Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all">
              <i className="fas fa-gavel text-blue-600 text-2xl mb-2"></i>
              <div className="font-semibold text-gray-800">Legal Updates</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all">
              <i className="fas fa-chart-line text-green-600 text-2xl mb-2"></i>
              <div className="font-semibold text-gray-800">Market Trends</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all">
              <i className="fas fa-shield-alt text-purple-600 text-2xl mb-2"></i>
              <div className="font-semibold text-gray-800">Platform Safety</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all">
              <i className="fas fa-lightbulb text-yellow-600 text-2xl mb-2"></i>
              <div className="font-semibold text-gray-800">Creator Tips</div>
            </div>
          </div>

          <NewsSection />

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Stay Ahead of the Industry</h3>
              <p className="text-blue-100 mb-6">
                Get exclusive insights, regulatory updates, and business tips delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <JoinModal isOpen={isJoinOpen} onClose={() => setJoinOpen(false)} />
      <SignInModal isOpen={isSignInOpen} onClose={() => setSignInOpen(false)} />
      <SitePopup />
    </main>
  );
}