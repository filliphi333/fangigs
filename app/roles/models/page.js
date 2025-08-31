
'use client';
import Image from 'next/image';
import Link from "next/link";

export default function ForModelsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/roles" className="hover:text-pink-600 transition-colors">Roles</Link>
            <span>›</span>
            <span className="text-pink-600 font-medium">For Models</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <article className="prose prose-pink prose-base sm:prose-lg lg:prose-xl max-w-none">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              💫 For Models: Your Step-by-Step Guide to Thriving on FanGigs
            </h1>
            <p className="text-xl text-pink-100 mb-6">
              Join thousands of successful models building their careers on our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup?type=talent" 
                className="bg-white text-pink-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all inline-block text-center">
                <i className="fas fa-user-plus mr-2"></i>
                Get Started Free
              </Link>
              <Link href="/find-work" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-pink-600 transition-all inline-block text-center">
                <i className="fas fa-search mr-2"></i>
                Browse Jobs
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 A New Era for Adult Performers</h2>
                <p className="text-gray-700 mb-4">
                  Welcome to <strong>FanGigs</strong>, a platform built specifically for adult content creators, talents, and industry professionals. 
                  If you're a model looking to connect with legitimate producers, find paid gigs, or collaborate with creators, you've just found your new home base.
                </p>
                <p className="text-gray-700 mb-4">
                  FanGigs was created with <strong>safety, opportunity, and freedom</strong> in mind. We believe models deserve a professional space where they can showcase 
                  their skills, control their image, and get booked—without spam, scams, or sleazy gatekeeping.
                </p>
              </div>

              {/* Step-by-step Guide */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-pink-600 mb-4">👣 Step 1: Join and Set Up Your Profile</h3>
                  <p className="text-gray-700 mb-4">
                    <strong>Signing up is free</strong> and takes only a few minutes. But your profile is your ticket to bookings, so give it some love.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Full name or stage name (whatever you want displayed)</li>
                    <li>Profile picture (headshot) – clear, professional or casual</li>
                    <li>Two full-body shots</li>
                    <li>Birthday, location, gender, orientation, camera experience</li>
                    <li>Short bio – show your vibe and what you're open to</li>
                  </ul>
                  <div className="bg-pink-50 border-l-4 border-pink-400 p-4 mt-4">
                    <p className="text-sm text-pink-800">
                      💡 <strong>Pro Tip:</strong> Make your profile public if you want producers to find you. Otherwise, they'll only see it if you apply for a job.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-pink-600 mb-4">💼 Step 2: Apply for Gigs That Match You</h3>
                  <p className="text-gray-700 mb-4">
                    Once your profile is ready, explore the <strong>Find Work</strong> page. You'll see casting calls from verified producers and creators:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Actors and actresses for scenes</li>
                      <li>Content collaborations</li>
                      <li>Photo shoots or livestreams</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Fetish or niche roles</li>
                      <li>Remote gigs (e.g., cam or solo content)</li>
                      <li>Travel opportunities</li>
                    </ul>
                  </div>
                </div>

                {/* Safety Section */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-green-700 mb-4">🔐 Your Privacy and Safety Matter</h3>
                  <p className="text-green-800 mb-4">We take your safety seriously:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-green-800">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Only verified producers can post or hire</li>
                      <li>Choose whether your profile is public or private</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-2">
                      <li>No real name or personal info required</li>
                      <li>Report/block features are always available</li>
                    </ul>
                  </div>
                </div>

                {/* Money Talk */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-700 mb-4">💸 Money Talk: Getting Paid</h3>
                  <p className="text-blue-800 mb-4">
                    Pay info is usually visible in each listing. If marked "confidential," just message them and ask.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 text-blue-800">
                    <div className="text-center">
                      <i className="fas fa-dollar-sign text-2xl mb-2"></i>
                      <p className="font-semibold">Flat Rate Jobs</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-handshake text-2xl mb-2"></i>
                      <p className="font-semibold">Content Trades</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-chart-line text-2xl mb-2"></i>
                      <p className="font-semibold">Rev-Share</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Profile Image */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <Image
                  src="/images/models-banner.jpg"
                  alt="Model working on set"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-md w-full"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Platform Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Jobs</span>
                    <span className="font-bold">500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified Producers</span>
                    <span className="font-bold">200+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Bookings</span>
                    <span className="font-bold">1000+</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-lg mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <Link href="/find-work" 
                    className="block w-full bg-pink-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                    <i className="fas fa-search mr-2"></i>
                    Browse Jobs
                  </Link>
                  <Link href="/edit-profile" 
                    className="block w-full border border-pink-500 text-pink-500 text-center py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
                    <i className="fas fa-user-edit mr-2"></i>
                    Edit Profile
                  </Link>
                  <Link href="/talent-dashboard" 
                    className="block w-full bg-gray-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🙋 Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-pink-600 mb-2">Is this like Model Mayhem or OnlyFans?</h4>
                <p className="text-gray-700">Not really. FanGigs is a job marketplace — not a content host or subscription platform.</p>
              </div>
              <div>
                <h4 className="font-bold text-pink-600 mb-2">Do I need prior experience?</h4>
                <p className="text-gray-700">Nope! Some listings are beginner-friendly. Just be honest about your experience level.</p>
              </div>
              <div>
                <h4 className="font-bold text-pink-600 mb-2">What if I also post jobs?</h4>
                <p className="text-gray-700">Great! You can act as both talent and producer with one account.</p>
              </div>
              <div>
                <h4 className="font-bold text-pink-600 mb-2">How much can I earn?</h4>
                <p className="text-gray-700">Earnings vary widely based on experience, location, and type of work. Many models earn $500-5000+ per month.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold mb-4">💖 Ready to Start Your Journey?</h2>
            <p className="text-xl text-pink-100 mb-6">
              Join thousands of successful models who trust FanGigs for their career growth
            </p>
            <Link href="/auth/signup?type=talent" 
              className="bg-white text-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-block">
              <i className="fas fa-rocket mr-2"></i>
              Start Your Profile Today
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
