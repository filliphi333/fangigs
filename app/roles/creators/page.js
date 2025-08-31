
'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function ForCreators() {
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
            <span className="text-pink-600 font-medium">For Creators</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <article className="max-w-none">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🚀 FanGigs for Content Creators
            </h1>
            <p className="text-xl text-pink-100 mb-6">
              Build your team, find talent, and scale your content creation like never before
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup?type=creator" 
                className="bg-white text-pink-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all inline-block text-center">
                <i className="fas fa-rocket mr-2"></i>
                Start Creating
              </Link>
              <Link href="/post-job" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-pink-600 transition-all inline-block text-center">
                <i className="fas fa-plus-circle mr-2"></i>
                Post Your First Gig
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <Image
                  src="/images/creators-banner.jpg"
                  alt="Content Creator Banner"
                  width={500}
                  height={350}
                  className="float-right ml-6 mb-4 rounded-lg shadow-md max-w-xs w-full"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <p className="text-gray-700 text-lg leading-relaxed">
                  Whether you're a seasoned adult content producer or just launching your creator journey, FanGigs gives you a professional, flexible, and safe space to find talent, build your crew, and grow your audience.
                </p>
              </div>

              {/* Why Use FanGigs */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">🚀 Why Use FanGigs?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-plus-circle text-pink-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Post Jobs Easily</h4>
                        <p className="text-gray-600 text-sm">Create listings for models, camerapeople, editors, and collaborators</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-shield-check text-pink-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Attract Verified Talent</h4>
                        <p className="text-gray-600 text-sm">Work with real people with completed profiles and portfolios</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-heart text-pink-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Save Your Favorites</h4>
                        <p className="text-gray-600 text-sm">Bookmark talent you like and view them later from your dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-users text-pink-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Build a Crew</h4>
                        <p className="text-gray-600 text-sm">From editors to assistants, staff your entire set</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posting Jobs */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">📸 Posting Your First Gig</h2>
                <p className="text-gray-700 mb-6">
                  Head over to the "Post a Job" button in your dashboard. Fill in details like:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3">Basic Details</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Job Title (e.g., "Seeking Model for Scene")</li>
                      <li>• Clear, professional description</li>
                      <li>• Pay amount or mark confidential</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3">Additional Info</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Location (real or remote)</li>
                      <li>• Tags to help talent find you</li>
                      <li>• Special requirements</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-pink-100 border-l-4 border-pink-400 p-4 mt-6">
                  <p className="text-pink-800">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Your job will appear instantly on our <strong>Find Work</strong> page, visible to every verified user.
                  </p>
                </div>
              </div>

              {/* Collaboration */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">🤝 Collaborate with Other Creators</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Content Collaborations</h4>
                    <p className="text-gray-700 mb-4">
                      Want to build a scene with another creator? Just post a collab gig, or browse other creators' job listings.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-800 text-sm">
                        <i className="fas fa-handshake mr-2"></i>
                        Tag your job as "Collab" for mutual gain opportunities
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Cross-Promotion</h4>
                    <p className="text-gray-700 mb-4">
                      Work with creators who have complementary audiences to expand your reach and create diverse content.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 text-sm">
                        <i className="fas fa-chart-line mr-2"></i>
                        Collaborations often result in 2x audience growth
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Build Full Set */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">🎥 Need a Cameraman or Editor?</h2>
                <p className="text-gray-700 mb-6">
                  You're not alone! Our platform is designed to help you build a full production team:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <i className="fas fa-video text-4xl text-pink-500"></i>
                    </div>
                    <h4 className="font-bold text-gray-800 text-center mb-3">Camerapeople</h4>
                    <p className="text-gray-700 text-sm text-center">
                      Shoot, light, and direct with skilled professionals who understand your vision
                    </p>
                  </div>
                  <div className="border border-gray-200 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <i className="fas fa-cut text-4xl text-purple-500"></i>
                    </div>
                    <h4 className="font-bold text-gray-800 text-center mb-3">Editors</h4>
                    <p className="text-gray-700 text-sm text-center">
                      Hire talent to cut trailers, promos, or full scenes with professional polish
                    </p>
                  </div>
                </div>
              </div>

              {/* Track Applications */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">📨 Track Applications</h2>
                <p className="text-gray-700 mb-6">
                  Each time someone applies to your job, they appear in your <strong>Applications</strong> tab. There, you can see:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-pink-50 rounded-xl">
                    <i className="fas fa-user text-2xl text-pink-500 mb-2"></i>
                    <h4 className="font-bold text-gray-800">Their Profile</h4>
                    <p className="text-gray-600 text-sm">Complete portfolio and stats</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <i className="fas fa-briefcase text-2xl text-purple-500 mb-2"></i>
                    <h4 className="font-bold text-gray-800">Role Applied</h4>
                    <p className="text-gray-600 text-sm">Specific position details</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <i className="fas fa-clock text-2xl text-blue-500 mb-2"></i>
                    <h4 className="font-bold text-gray-800">Application Time</h4>
                    <p className="text-gray-600 text-sm">When they showed interest</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Creator Stats */}
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Creator Benefits</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Available Talent</span>
                    <span className="font-bold">2000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Response Time</span>
                    <span className="font-bold">2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold">92%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Creator Tools</h4>
                <div className="space-y-3">
                  <Link href="/post-job" 
                    className="block w-full bg-pink-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                    <i className="fas fa-plus-circle mr-2"></i>
                    Post a Job
                  </Link>
                  <Link href="/find-talent" 
                    className="block w-full border border-pink-500 text-pink-500 text-center py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
                    <i className="fas fa-search mr-2"></i>
                    Browse Talent
                  </Link>
                  <Link href="/producer-dashboard" 
                    className="block w-full bg-gray-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </Link>
                </div>
              </div>

              {/* Upcoming Features */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-lg mb-4">🔗 Coming Soon</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <i className="fas fa-map-marker-alt text-pink-500 mt-1 mr-3"></i>
                    <div>
                      <p className="font-semibold text-gray-800">Creator Travel Map</p>
                      <p className="text-gray-600">Show where you'll be shooting</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-comments text-purple-500 mt-1 mr-3"></i>
                    <div>
                      <p className="font-semibold text-gray-800">Built-in Messaging</p>
                      <p className="text-gray-600">Direct communication tools</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-file-contract text-blue-500 mt-1 mr-3"></i>
                    <div>
                      <p className="font-semibold text-gray-800">Contract Generator</p>
                      <p className="text-gray-600">Formalize agreements easily</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold mb-4">💬 Join FanGigs Today</h2>
            <p className="text-xl text-pink-100 mb-6">
              FanGigs is your platform to build, shoot, and grow with professionalism and ease. We're here to support the adult creator community and give you the tools you need to make more — and do it better.
            </p>
            <Link href="/auth/signup?type=creator" 
              className="bg-white text-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-block">
              <i className="fas fa-star mr-2"></i>
              Start Creating Today
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
