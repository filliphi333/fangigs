
'use client';
import Image from "next/image";
import Link from "next/link";

export default function CameraPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/roles" className="hover:text-blue-600 transition-colors">Roles</Link>
            <span>›</span>
            <span className="text-blue-600 font-medium">For Camera Operators</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <article className="max-w-none">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl p-8 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              📹 Opportunities for Camera Operators on FanGigs
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Turn your videography skills into a thriving freelance career
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup?type=talent" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all inline-block text-center">
                <i className="fas fa-camera mr-2"></i>
                Start Camera Career
              </Link>
              <Link href="/find-work" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-all inline-block text-center">
                <i className="fas fa-search mr-2"></i>
                Find Camera Jobs
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <Image
                  src="/images/camera-banner.jpg"
                  alt="Camera operator on set"
                  width={480}
                  height={300}
                  className="float-right ml-6 mb-4 rounded-lg shadow-md max-w-xs w-full"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <p className="text-gray-700 text-lg leading-relaxed">
                  The adult content industry isn't only about being in front of the camera — there's an entire world behind it that makes every scene possible. If you're a camera operator or someone with videography experience, FanGigs is your gateway into a creative, high-demand segment of adult production.
                </p>
              </div>

              {/* Why Join */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Why Join as a Camera Operator?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h4 className="font-bold text-blue-700 mb-3">Growing Market</h4>
                    <p className="text-gray-700">
                      With the rise of independent content creators and platforms like OnlyFans, there's been an explosion of demand for skilled camerapeople.
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h4 className="font-bold text-green-700 mb-3">Professional Bridge</h4>
                    <p className="text-gray-700">
                      FanGigs bridges the gap between creators and freelance camera talent, creating professional working relationships.
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Types */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">What Kind of Work Can You Expect?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-user text-blue-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Solo Content Shoots</h4>
                        <p className="text-gray-600 text-sm">One-on-one content creation with individual creators</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-video text-blue-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Behind-the-scenes</h4>
                        <p className="text-gray-600 text-sm">Documentary-style coverage of production</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-calendar text-blue-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Event Coverage</h4>
                        <p className="text-gray-600 text-sm">Industry events, launches, and special occasions</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-building text-green-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Studio Production</h4>
                        <p className="text-gray-600 text-sm">Professional studio environments with full lighting</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-tree text-green-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Outdoor Shoots</h4>
                        <p className="text-gray-600 text-sm">Location-based content in natural settings</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-cogs text-green-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Multi-angle Setup</h4>
                        <p className="text-gray-600 text-sm">Complex lighting and camera arrangements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Get Started */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">How to Get Started</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Create Your Profile</h4>
                      <p className="text-gray-700">Sign up and choose "Camera Operator" role. Upload examples of your work and list your equipment.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Browse Job Listings</h4>
                      <p className="text-gray-700">Use the "Find Work" section to discover shoots. Many cover travel costs for the right operator.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Apply or Connect</h4>
                      <p className="text-gray-700">Apply to posted jobs or save creators you'd like to collaborate with for future projects.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Get Hired & Shoot</h4>
                      <p className="text-gray-700">Once approved, agree on logistics, bring your gear, and capture amazing content!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Benefits of Using FanGigs</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <i className="fas fa-shield-check text-blue-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Verified Listings:</strong> Work with real content creators and avoid scams.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-comments text-blue-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Direct Communication:</strong> Chat with producers and creators through the platform.
                      </div>
                    </li>
                  </ul>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <i className="fas fa-portfolio text-green-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Portfolio Building:</strong> Gain access to varied shoots and grow your demo reel.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-clock text-green-500 mt-1 mr-3"></i>
                      <div>
                        <strong>Flexible Jobs:</strong> Work when and where you want, with roles across the country.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Experience Levels */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Whether You're a Pro or a Passionate Beginner</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h4 className="font-bold text-green-700 mb-3">Experienced Operators</h4>
                    <p className="text-gray-700 mb-4">
                      Bring your professional skills to high-end productions with established creators and studios.
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Premium equipment requirements</li>
                      <li>• Higher day rates ($300-800+)</li>
                      <li>• Multi-camera setups</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h4 className="font-bold text-blue-700 mb-3">Passionate Beginners</h4>
                    <p className="text-gray-700 mb-4">
                      Start with a DSLR and passion for visuals. Many creators need energetic collaborators to grow with.
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Entry-level opportunities</li>
                      <li>• Mentorship available</li>
                      <li>• Skill development focus</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Camera Operator Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Operator Benefits</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Gigs</span>
                    <span className="font-bold">200+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Day Rate</span>
                    <span className="font-bold">$250-600</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel Opportunities</span>
                    <span className="font-bold">60%</span>
                  </div>
                </div>
              </div>

              {/* Equipment List */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Popular Equipment</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <i className="fas fa-camera text-blue-500 mr-3"></i>
                    <span>DSLR/Mirrorless Cameras</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-lightbulb text-yellow-500 mr-3"></i>
                    <span>LED Light Panels</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-microphone text-red-500 mr-3"></i>
                    <span>Audio Equipment</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-cog text-gray-500 mr-3"></i>
                    <span>Tripods & Stabilizers</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-lg mb-4">Get Started</h4>
                <div className="space-y-3">
                  <Link href="/find-work" 
                    className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                    <i className="fas fa-search mr-2"></i>
                    Find Camera Jobs
                  </Link>
                  <Link href="/edit-profile" 
                    className="block w-full border border-blue-500 text-blue-500 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    <i className="fas fa-user-edit mr-2"></i>
                    Setup Portfolio
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

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold mb-4">Lights. Camera. Action.</h2>
            <p className="text-xl text-blue-100 mb-6">
              The adult content world values creativity, reliability, and professionalism — if you bring those, the rest will follow. Start browsing jobs, connect with creators, and bring your cinematography skills to the set.
            </p>
            <Link href="/auth/signup?type=talent" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-block">
              <i className="fas fa-video mr-2"></i>
              Welcome to FanGigs
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
