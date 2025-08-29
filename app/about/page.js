
'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>About FanGigs - Professional Adult Content Platform</title>
        <meta name="description" content="Learn about FanGigs, the professional platform connecting adult content creators with talent, collaborators, and opportunities." />
      </head>
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation Breadcrumb */}
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Home
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-yellow-300">FanGigs</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              The professional platform empowering adult content creators worldwide
            </p>
          </div>
        </section>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Mission Statement */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-blue-600">FanGigs</strong> is a professional platform connecting adult content creators with
                talents, collaborators, and job opportunities. Our mission is to empower creators and performers by
                simplifying the hiring process, offering safe networking, and fostering creative freedom.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you're a model looking for your next shoot, a producer in need of talent, or a fan commissioning
                custom content, FanGigs helps you make the right connections with transparency, professionalism, and privacy.
              </p>
            </section>

            {/* Features Grid */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="text-blue-600 text-3xl mb-4">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Job Board & Casting</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Professional casting calls</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Gig opportunities</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Local and remote work</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="text-purple-600 text-3xl mb-4">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Profiles</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Verified profiles & portfolios</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Creator & Talent dashboards</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Public and private options</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6">
                  <div className="text-pink-600 text-3xl mb-4">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Travel & Availability</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Interactive travel map</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Availability tracking</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Location-based matching</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                  <div className="text-yellow-600 text-3xl mb-4">
                    <i className="fas fa-star"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Features</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Custom content commissions</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Industry news & updates</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i>Secure messaging system</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Built With You in Mind</h2>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8">
                <p className="text-lg text-gray-800 leading-relaxed text-center">
                  FanGigs was created to support the real needs of adult industry professionals — with tools that simplify
                  logistics, expand opportunities, and prioritize <strong className="text-purple-700">safety</strong>, <strong className="text-blue-700">consent</strong>, and <strong className="text-pink-700">professionalism</strong>.
                </p>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/post-job">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i className="fas fa-plus-circle mr-2"></i>
                    Post a Job
                  </button>
                </Link>
                <Link href="/find-work">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i className="fas fa-search mr-2"></i>
                    Find Work
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </article>
      </main>
    </>
  );
}
