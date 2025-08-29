
'use client';
import Link from 'next/link';

export default function TermsOfUse() {
  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Terms of Use - FanGigs</title>
        <meta name="description" content="Read FanGigs Terms of Use for our adult content creator platform. Understand your rights and responsibilities." />
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
              <i className="fas fa-file-contract mr-3"></i>
              Terms of Use
            </h1>
            <p className="text-xl text-blue-100">Understanding your rights and responsibilities</p>
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

              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg">
                <p className="text-red-800 font-semibold m-0">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  By using FanGigs ("we", "our", "us"), you agree to these Terms of Use. Please read them carefully before using the site.
                </p>
              </div>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-id-card text-blue-600 mr-3"></i>
                  1. Eligibility
                </h2>
                <div className="bg-blue-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0 flex items-center">
                    <i className="fas fa-birthday-cake text-blue-500 mr-3"></i>
                    You must be at least <strong>18 years old</strong> to create an account or participate in any activities on this platform.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-user-cog text-purple-600 mr-3"></i>
                  2. User Accounts
                </h2>
                <div className="grid md:grid-cols-1 gap-4">
                  <div className="bg-purple-50 rounded-lg p-6">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <i className="fas fa-lock text-purple-500 mr-3 mt-1"></i>
                        You are responsible for the security of your account
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-key text-purple-500 mr-3 mt-1"></i>
                        Do not share your login credentials with others
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-user-times text-purple-500 mr-3 mt-1"></i>
                        You may not impersonate another person or create a fake profile
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-shield-alt text-red-600 mr-3"></i>
                  3. Content Guidelines
                </h2>
                <div className="bg-red-50 rounded-xl p-6 mb-4">
                  <p className="text-red-800 font-semibold mb-4">You agree not to post or upload content that:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-red-700">
                      <li><i className="fas fa-times-circle mr-2"></i>Is illegal, hateful, or abusive</li>
                      <li><i className="fas fa-times-circle mr-2"></i>Violates intellectual property rights</li>
                    </ul>
                    <ul className="space-y-2 text-red-700">
                      <li><i className="fas fa-times-circle mr-2"></i>Involves minors or non-consensual acts</li>
                      <li><i className="fas fa-times-circle mr-2"></i>Includes spam, scams, or misleading info</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-credit-card text-green-600 mr-3"></i>
                  4. Payments & Transactions
                </h2>
                <div className="bg-green-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    <i className="fas fa-handshake text-green-500 mr-2"></i>
                    Users are responsible for negotiating and fulfilling their own payment terms. FanGigs is not responsible for enforcing private agreements unless explicitly stated.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-ban text-orange-600 mr-3"></i>
                  5. Termination
                </h2>
                <div className="bg-orange-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    We may suspend or terminate your access at any time for violating these terms or engaging in suspicious, illegal, or harmful behavior.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-copyright text-indigo-600 mr-3"></i>
                  6. Intellectual Property
                </h2>
                <div className="bg-indigo-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    All platform content, branding, and code is the property of FanGigs unless otherwise noted. You may not use it without permission.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
                  7. Limitation of Liability
                </h2>
                <div className="bg-yellow-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    FanGigs is not responsible for any damages, disputes, or losses resulting from interactions, job arrangements, or platform usage.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-sync-alt text-teal-600 mr-3"></i>
                  8. Changes to Terms
                </h2>
                <div className="bg-teal-50 rounded-xl p-6">
                  <p className="text-gray-700 m-0">
                    We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the new terms.
                  </p>
                </div>
              </section>

              <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  <i className="fas fa-envelope mr-3"></i>
                  Questions?
                </h2>
                <p className="text-blue-100 mb-4">
                  If you have questions about these terms:
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
