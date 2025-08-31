
'use client';
import Image from "next/image";
import Link from "next/link";

export default function StudiosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/roles" className="hover:text-blue-600 transition-colors">Roles</Link>
            <span>›</span>
            <span className="text-blue-600 font-medium">For Studios</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <article className="max-w-none">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🎬 For Studios: Discover New Talent with a Professional Touch
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Connect with fresh talent and modernize your casting process
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup?type=creator" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all inline-block text-center">
                <i className="fas fa-building mr-2"></i>
                Create Studio Account
              </Link>
              <Link href="/post-job" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-all inline-block text-center">
                <i className="fas fa-plus-circle mr-2"></i>
                Post Casting Call
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <Image
                  src="/images/studio.jpg"
                  alt="Film crew on a professional adult set"
                  width={480}
                  height={300}
                  className="float-right ml-6 mb-4 rounded-lg shadow-md max-w-xs w-full"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <p className="text-gray-700 text-lg leading-relaxed">
                  FanGigs isn't just for independent creators — it's also a bridge between professional studios and the next generation of performers. If you run a studio and are constantly looking for fresh talent, this platform offers a new, respectful way to recruit people who might never set foot on a traditional porn site.
                </p>
              </div>

              {/* Why FanGigs Appeals */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Why FanGigs Appeals to New Faces</h2>
                <p className="text-gray-700 mb-6">
                  Many aspiring models, actors, and creators are open to exploring the adult space — but are intimidated or turned off by the stigma around porn websites. FanGigs changes that. By presenting adult gigs in a clean, professional, mainstream layout — without nudity or explicit content — the platform creates an approachable entry point for people who wouldn't normally apply through your studio's "Apply" page.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h4 className="font-bold text-blue-700 mb-3">Traditional Approach</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Limited to industry veterans</li>
                      <li>• Stigmatized application process</li>
                      <li>• Explicit content requirement</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h4 className="font-bold text-green-700 mb-3">FanGigs Approach</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Attracts fresh, diverse talent</li>
                      <li>• Professional, mainstream feel</li>
                      <li>• Safe-for-work profiles only</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What Studios Can Post */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Studios Can Post Gigs, Auditions & Open Calls</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Casting Types</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li><strong>Standard casting calls:</strong> Post opportunities for scenes, roles, or long-term contracts</li>
                      <li><strong>Local or remote work:</strong> Whether you're scouting locally or traveling, list exact dates and locations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Visibility Options</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li><strong>Public or private:</strong> Allow public applications, or request verified profiles first</li>
                      <li><strong>Priority visibility:</strong> Studio gigs get enhanced placement on our platform</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-purple-600 mb-6">What Makes FanGigs Different?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <i className="fas fa-shield-alt text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <strong>No nudity or explicit photos:</strong> Talent applies with clean, professional profiles. All photos are safe-for-work.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-star text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Focused on talent, not followers:</strong> This isn't about clout — it's about commitment, diversity, and potential.
                      </div>
                    </li>
                  </ul>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <i className="fas fa-filter text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Profile filtering:</strong> Search by experience level, location, gender, orientation, and more.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-certificate text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Legitimacy:</strong> FanGigs helps studios appear modern, professional, and talent-friendly.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Getting Started */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">How to Get Started</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Create a verified Studio profile</h4>
                      <p className="text-gray-700">Add a company bio, logo, and social links to establish credibility.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Post your current casting calls</h4>
                      <p className="text-gray-700">Even recurring or general interest postings help build your presence.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Review applicants</h4>
                      <p className="text-gray-700">View headshots, social links, and tags like camera experience or availability.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Hire, schedule, and connect</h4>
                      <p className="text-gray-700">All on a platform that respects the industry while protecting your brand.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Studio Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Studio Benefits</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Fresh Talent Pool</span>
                    <span className="font-bold">1000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Applications</span>
                    <span className="font-bold">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold">85%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Get Started Today</h4>
                <div className="space-y-3">
                  <Link href="/post-job" 
                    className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                    <i className="fas fa-plus-circle mr-2"></i>
                    Post First Casting
                  </Link>
                  <Link href="/find-talent" 
                    className="block w-full border border-blue-500 text-blue-500 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    <i className="fas fa-search mr-2"></i>
                    Browse Talent
                  </Link>
                  <Link href="/producer-dashboard" 
                    className="block w-full bg-gray-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Studio Dashboard
                  </Link>
                </div>
              </div>

              {/* Success Stories */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-lg mb-4">Success Stories</h4>
                <div className="space-y-4 text-sm">
                  <div className="border-l-4 border-blue-400 pl-4">
                    <p className="italic text-gray-700">"Found 3 amazing new performers in our first month. The quality of talent is incredible."</p>
                    <p className="font-semibold text-gray-800 mt-2">- Premium Studios</p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-4">
                    <p className="italic text-gray-700">"Finally, a professional platform that attracts real talent, not just industry veterans."</p>
                    <p className="font-semibold text-gray-800 mt-2">- Creative Films</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold mb-4">We Help You Stay Ahead</h2>
            <p className="text-xl text-blue-100 mb-6">
              Studios using FanGigs are showing future stars that adult entertainment can be a career — not just a stunt. You build trust. You widen your reach. And you position your company as part of the modern, digital future of this industry.
            </p>
            <Link href="/auth/signup?type=creator" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-block">
              <i className="fas fa-rocket mr-2"></i>
              Start Casting Today
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
