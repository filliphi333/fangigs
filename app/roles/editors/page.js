
'use client';
import Image from "next/image";
import Link from "next/link";

export default function EditorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/roles" className="hover:text-purple-600 transition-colors">Roles</Link>
            <span>›</span>
            <span className="text-purple-600 font-medium">For Editors</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <article className="max-w-none">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🎬 For Editors: Transform Raw Footage into Stunning Content
            </h1>
            <p className="text-xl text-purple-100 mb-6">
              Join the content creation revolution as a skilled video editor
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup?type=talent" 
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all inline-block text-center">
                <i className="fas fa-video mr-2"></i>
                Start Editing Career
              </Link>
              <Link href="/find-work" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-purple-600 transition-all inline-block text-center">
                <i className="fas fa-search mr-2"></i>
                Find Edit Jobs
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <Image
                  src="/images/editor-banner.jpg"
                  alt="Video editor working on adult content"
                  width={480}
                  height={300}
                  className="float-right ml-6 mb-4 rounded-lg shadow-md max-w-xs w-full"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <p className="text-gray-700 text-lg leading-relaxed">
                  In a world flooded with content, good editing is what separates a forgettable video from a fan-favorite. If you're a video editor with a sharp eye and fast fingers, FanGigs offers a way to find paying clients in the adult industry — creators, studios, and agencies who need your skills to elevate their content.
                </p>
              </div>

              {/* Why Join */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-purple-600 mb-6">Why Join FanGigs as a Video Editor?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Growing Demand</h4>
                    <p className="text-gray-700">
                      With the adult industry moving toward high-quality, personalized content, creators need editors who can bring polish, emotion, and story to their scenes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Flexible Work</h4>
                    <p className="text-gray-700">
                      Work remotely with creators worldwide, set your own rates, and choose projects that match your skills and interests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Types */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-purple-600 mb-6">Types of Projects You Can Work On</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-film text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Full-scene editing</h4>
                        <p className="text-gray-600 text-sm">Complete post-production with music and color grading</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-share-alt text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Social media content</h4>
                        <p className="text-gray-600 text-sm">Teaser/trailer creation for various platforms</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-cut text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Content organization</h4>
                        <p className="text-gray-600 text-sm">Cutting long shoots into shorter, sellable clips</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-camera text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Multi-camera sync</h4>
                        <p className="text-gray-600 text-sm">Synchronization and enhancement of multiple angles</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-tag text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Branding</h4>
                        <p className="text-gray-600 text-sm">Intro/outro creation and watermarking</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-volume-up text-purple-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="font-bold text-gray-800">Audio enhancement</h4>
                        <p className="text-gray-600 text-sm">Sound cleanup and background music</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-purple-600 mb-6">How It Works</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Create Your Profile</h4>
                      <p className="text-gray-700">Sign up as an Editor. Upload examples of your work and describe your specialties.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Browse Jobs or Get Invited</h4>
                      <p className="text-gray-700">Find editing projects or receive invitations based on your profile and portfolio.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Negotiate the Deal</h4>
                      <p className="text-gray-700">Agree on timeline, scope, file formats, payment, and any NDAs required.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Deliver and Get Paid</h4>
                      <p className="text-gray-700">Upload your finished work, get feedback, make revisions, and receive payment.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-purple-600 mb-6">What Makes a Great Editor for This Industry?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Technical Skills</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Sensitivity to pacing and mood</li>
                      <li>• Clean cuts without over-editing</li>
                      <li>• Color grading and audio mixing</li>
                      <li>• Multi-format export knowledge</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Professional Qualities</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Discretion and professionalism</li>
                      <li>• Understanding creator's brand</li>
                      <li>• Platform-specific optimization</li>
                      <li>• Reliable communication</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Editor Benefits */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Editor Benefits</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Remote Work</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Project Pay</span>
                    <span className="font-bold">$200-800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Projects</span>
                    <span className="font-bold">150+</span>
                  </div>
                </div>
              </div>

              {/* Popular Software */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h4 className="font-bold text-lg mb-4">Popular Tools</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <i className="fas fa-video text-purple-500 mr-3"></i>
                    <span>Adobe Premiere Pro</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-magic text-purple-500 mr-3"></i>
                    <span>After Effects</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-cut text-purple-500 mr-3"></i>
                    <span>Final Cut Pro</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-film text-purple-500 mr-3"></i>
                    <span>DaVinci Resolve</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-lg mb-4">Get Started</h4>
                <div className="space-y-3">
                  <Link href="/find-work" 
                    className="block w-full bg-purple-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                    <i className="fas fa-search mr-2"></i>
                    Find Edit Jobs
                  </Link>
                  <Link href="/edit-profile" 
                    className="block w-full border border-purple-500 text-purple-500 text-center py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 text-center mt-10">
            <h2 className="text-2xl font-bold mb-4">Ready to Turn Footage into Fantasy?</h2>
            <p className="text-xl text-purple-100 mb-6">
              Your technical skills are valuable — in this space, so is your artistic voice. FanGigs helps editors stand out, connect with paying clients, and grow their brand while supporting creators.
            </p>
            <Link href="/auth/signup?type=talent" 
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-block">
              <i className="fas fa-play mr-2"></i>
              Start Your Editing Journey
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
