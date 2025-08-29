
'use client';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Privacy Policy - FanGigs</title>
        <meta name="description" content="Learn how FanGigs protects your privacy and handles your personal information on our adult content creator platform." />
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

        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <i className="fas fa-shield-alt mr-3"></i>
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100">Your privacy and data protection matter to us</p>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8 text-center bg-gray-50 rounded-lg p-4">
                <i className="fas fa-calendar-alt mr-2"></i>
                <strong>Last updated:</strong> January 15, 2025
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
                <p className="text-gray-800 leading-relaxed m-0">
                  FanGigs ("we", "our", or "us") values your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website and services.
                </p>
              </div>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-database text-blue-600 mr-3"></i>
                  1. Information We Collect
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                      Personal information (name, email, location, profile photos)
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                      Account details and login credentials
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                      User-generated content (bios, job listings, messages)
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                      Technical data (device, browser, IP address)
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-cogs text-purple-600 mr-3"></i>
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 mb-4">We use your information to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700">
                      <li><i className="fas fa-user-plus text-purple-500 mr-2"></i>Create and manage user accounts</li>
                      <li><i className="fas fa-eye text-purple-500 mr-2"></i>Display your profile and job postings</li>
                      <li><i className="fas fa-comments text-purple-500 mr-2"></i>Facilitate communication</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700">
                      <li><i className="fas fa-shield-alt text-blue-500 mr-2"></i>Improve site functionality and security</li>
                      <li><i className="fas fa-bell text-blue-500 mr-2"></i>Send notifications and updates</li>
                      <li><i className="fas fa-chart-line text-blue-500 mr-2"></i>Analyze platform usage</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-share-alt text-pink-600 mr-3"></i>
                  3. Sharing of Information
                </h2>
                <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-4 rounded-r-lg">
                  <p className="text-red-800 font-semibold m-0">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    We do not sell your personal data.
                  </p>
                </div>
                <p className="text-gray-700 mb-4">Information may be shared:</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-server text-gray-500 mr-3 mt-1"></i>
                    With service providers for site functionality (e.g. hosting)
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-gavel text-gray-500 mr-3 mt-1"></i>
                    When legally required (e.g. court order)
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-handshake text-gray-500 mr-3 mt-1"></i>
                    With your consent or as part of your public profile
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-clock text-yellow-600 mr-3"></i>
                  4. Data Retention
                </h2>
                <div className="bg-yellow-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    We retain your information as long as your account is active or as needed to provide services and comply with legal obligations.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-user-shield text-green-600 mr-3"></i>
                  5. Your Rights
                </h2>
                <div className="bg-green-50 rounded-xl p-6">
                  <p className="text-gray-700 mb-4">
                    You may update your profile, change visibility settings, or delete your account at any time. 
                  </p>
                  <p className="text-gray-700 m-0">
                    For assistance, please contact <strong className="text-green-700">contact@fan-gigs.com</strong>.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-lock text-blue-600 mr-3"></i>
                  6. Security
                </h2>
                <div className="bg-blue-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    We take reasonable precautions to protect your data, including encrypted connections and access controls. However, no system is 100% secure.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-edit text-purple-600 mr-3"></i>
                  7. Changes to This Policy
                </h2>
                <div className="bg-purple-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    We may update this policy as needed. Changes will be posted on this page with an updated date.
                  </p>
                </div>
              </section>

              <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  <i className="fas fa-envelope mr-3"></i>
                  Contact Us
                </h2>
                <p className="text-blue-100 mb-4">
                  For questions or concerns about this Privacy Policy:
                </p>
                <a href="mailto:contact@fan-gigs.com" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  contact@fan-gigs.com
                </a>
              </section>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
