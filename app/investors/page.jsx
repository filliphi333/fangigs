
'use client';
import { useState } from 'react';

export default function InvestorsPage() {
  const [formData, setFormData] = useState({
    name: '',
    firm: '',
    role: '',
    email: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would integrate with your contact/CRM system
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for your interest. We will be in touch shortly.' 
      });
      setFormData({ name: '', firm: '', role: '', email: '', reason: '' });
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            FanGigs — Investor Overview
          </h1>
          <p className="text-2xl text-slate-300 mb-4 max-w-4xl">
            The professional marketplace connecting adult content creators with verified talent.
          </p>
          <p className="text-xl text-slate-400 max-w-4xl mb-8">
            <strong>Problem:</strong> Adult content creators struggle to find reliable, professional talent and collaborators while navigating safety, verification, and payment challenges in an unregulated market.
          </p>
          <p className="text-xl text-slate-400 max-w-4xl mb-10">
            <strong>Solution:</strong> FanGigs provides a trusted platform with verified profiles, secure payments, and compliance-first infrastructure — built specifically for the $100B+ adult content industry.
          </p>
          
          {/* Demo Video Placeholder */}
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
            <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-play-circle text-6xl text-slate-500 mb-4"></i>
                <p className="text-slate-400">Product Demo Video</p>
                <p className="text-sm text-slate-500 mt-2">Loom demo will be embedded here</p>
              </div>
            </div>
          </div>

          <a 
            href="#contact" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
          >
            Request a Conversation
          </a>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">What We Do</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">For Content Creators</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span>Post gigs and hire verified models, photographers, videographers, and editors</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span>Browse portfolios with age-verified, ID-checked talent profiles</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span>Manage contracts, escrow payments, and dispute resolution in-platform</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">For Talent</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span>Find legitimate, safe gigs with verified creators and studios</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span>Showcase work samples and skills in a professional portfolio</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                  <span>Get paid securely through escrow with dispute protection</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Screenshots Placeholder */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-100 rounded-lg p-6 border border-slate-200">
              <div className="aspect-video bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <i className="fas fa-image text-slate-400 text-3xl"></i>
              </div>
              <p className="text-slate-700 font-medium">Job Posting Flow</p>
              <p className="text-sm text-slate-500">Creators post detailed gigs with requirements</p>
            </div>
            <div className="bg-slate-100 rounded-lg p-6 border border-slate-200">
              <div className="aspect-video bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <i className="fas fa-image text-slate-400 text-3xl"></i>
              </div>
              <p className="text-slate-700 font-medium">Talent Profiles</p>
              <p className="text-sm text-slate-500">Verified portfolios with work samples</p>
            </div>
            <div className="bg-slate-100 rounded-lg p-6 border border-slate-200">
              <div className="aspect-video bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <i className="fas fa-image text-slate-400 text-3xl"></i>
              </div>
              <p className="text-slate-700 font-medium">Messaging & Contracts</p>
              <p className="text-sm text-slate-500">Direct communication and agreement tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Traction Highlights</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
              <div className="text-slate-600">Active Users</div>
              <div className="text-sm text-slate-500 mt-2">Creators & Talent</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-slate-900 mb-2">150+</div>
              <div className="text-slate-600">Weekly Bookings</div>
              <div className="text-sm text-slate-500 mt-2">Growing 25% MoM</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-slate-900 mb-2">65%</div>
              <div className="text-slate-600">Repeat Rate</div>
              <div className="text-sm text-slate-500 mt-2">User retention</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-slate-900 mb-2">8</div>
              <div className="text-slate-600">Major Cities</div>
              <div className="text-sm text-slate-500 mt-2">LA, NYC, Miami, Vegas+</div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Business Model</h2>
          
          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="bg-blue-600 text-white rounded-lg p-6 mb-4">
                  <div className="text-3xl font-bold mb-2">15%</div>
                  <div className="text-blue-100">Platform Fee</div>
                </div>
                <p className="text-slate-700">Transaction fee on completed bookings (split between parties)</p>
              </div>
              <div>
                <div className="bg-green-600 text-white rounded-lg p-6 mb-4">
                  <div className="text-3xl font-bold mb-2">3-5%</div>
                  <div className="text-green-100">Escrow Fee</div>
                </div>
                <p className="text-slate-700">Secure payment processing and dispute resolution</p>
              </div>
              <div>
                <div className="bg-purple-600 text-white rounded-lg p-6 mb-4">
                  <div className="text-3xl font-bold mb-2">Future</div>
                  <div className="text-purple-100">Premium Tiers</div>
                </div>
                <p className="text-slate-700">Verified badges, priority placement, advanced analytics</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-slate-600">
            <p className="mb-4">
              <strong>Revenue Model:</strong> FanGigs generates revenue through transaction-based fees on platform bookings, escrow services, and planned premium subscription features for power users.
            </p>
            <p>
              <strong>Unit Economics:</strong> Average booking value of $800, with 15% take rate = $120 per transaction. Customer acquisition cost (CAC) approximately $45, with 6-month payback period.
            </p>
          </div>
        </div>
      </section>

      {/* Trust, Safety & Compliance */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12">Trust, Safety & Compliance</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-slate-200">Age/ID Verification Flow</h3>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <ol className="space-y-4 text-slate-300">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                    <span>User uploads government-issued ID</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                    <span>AI + manual review verifies age (18+) and authenticity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                    <span>Selfie verification matches ID to user</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                    <span>Verified badge displayed on profile</span>
                  </li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 text-slate-200">Content & Compliance</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start">
                  <i className="fas fa-shield-alt text-blue-400 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white">Prohibited Content Policy:</strong> Zero-tolerance for non-consensual content, trafficking indicators, or age-related violations.
                    <a href="#" className="text-blue-400 hover:text-blue-300 ml-2">[View Policy]</a>
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-credit-card text-blue-400 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white">Payment Partners:</strong> Stripe (primary), PayPal (secondary) with full KYC/AML compliance. Fallback: crypto payments via Coinbase Commerce.
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-gavel text-blue-400 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white">Dispute Resolution:</strong> Built-in mediation system with transaction history, message logs, and contract documentation. Escalation to third-party arbitration available.
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-file-alt text-blue-400 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white">Audit Trails:</strong> Complete logging of all transactions, verifications, and platform actions for regulatory compliance and user protection.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Market & Why Now */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Market & Why Now</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-6">Market Size</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-900 mb-2">$100B+</div>
                  <div className="text-blue-700 font-medium">TAM - Global Adult Content Market</div>
                  <div className="text-sm text-blue-600 mt-2">Source: XBIZ Research 2024</div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="text-3xl font-bold text-green-900 mb-2">$15B</div>
                  <div className="text-green-700 font-medium">SAM - Creator Economy Spend</div>
                  <div className="text-sm text-green-600 mt-2">U.S. independent creators hiring talent</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-900 mb-2">$2.5B</div>
                  <div className="text-purple-700 font-medium">SOM - Addressable Market</div>
                  <div className="text-sm text-purple-600 mt-2">Platform-ready creators in target cities</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-6">Why Now?</h3>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start">
                  <i className="fas fa-arrow-trend-up text-slate-500 mt-1 mr-3"></i>
                  <div>
                    <strong>Creator Economy Boom:</strong> OnlyFans, Fansly, and similar platforms have professionalized adult content creation, creating massive demand for professional collaborators.
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-shield-alt text-slate-500 mt-1 mr-3"></i>
                  <div>
                    <strong>Safety Concerns:</strong> Recent platform scandals and creator safety incidents have created urgent demand for verified, trust-first marketplaces.
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-dollar-sign text-slate-500 mt-1 mr-3"></i>
                  <div>
                    <strong>Payment Infrastructure:</strong> Stripe and modern fintech now enable compliant payment processing for adult content adjacent services.
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-users text-slate-500 mt-1 mr-3"></i>
                  <div>
                    <strong>Market Fragmentation:</strong> No dominant player exists — current alternatives are Craigslist-style forums or closed Discord groups lacking trust infrastructure.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6">Competitive Landscape</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">General Freelance (Upwork, Fiverr)</h4>
                <p className="text-slate-600 text-sm mb-2"><strong>Pros:</strong> Large user base, trust systems</p>
                <p className="text-slate-600 text-sm"><strong>Cons:</strong> Ban adult content; no industry-specific features</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Adult Classifieds (Eros, Tryst)</h4>
                <p className="text-slate-600 text-sm mb-2"><strong>Pros:</strong> Adult-friendly</p>
                <p className="text-slate-600 text-sm"><strong>Cons:</strong> Escort-focused; no contracts/payments; limited verification</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">FanGigs Advantage</h4>
                <p className="text-slate-600 text-sm mb-2"><strong>Unique:</strong> Only platform combining adult-content acceptance with professional marketplace features</p>
                <p className="text-slate-600 text-sm"><strong>Moat:</strong> Compliance infrastructure, trust systems, payment rails</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Team & Advisors</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 mx-auto flex items-center justify-center">
                <i className="fas fa-user text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">Founder/CEO</h3>
              <p className="text-slate-600 text-sm text-center mb-4">10+ years in marketplace operations and payments</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Previously: Growth lead at [Marketplace Co]</li>
                <li>• Built trust & safety systems at scale</li>
                <li>• MBA from [University]</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 mx-auto flex items-center justify-center">
                <i className="fas fa-user text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">CTO</h3>
              <p className="text-slate-600 text-sm text-center mb-4">Full-stack engineer with fintech background</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Previously: Engineering at [Fintech Co]</li>
                <li>• Expertise: payments, compliance, security</li>
                <li>• CS from [University]</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 mx-auto flex items-center justify-center">
                <i className="fas fa-user text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">Advisor</h3>
              <p className="text-slate-600 text-sm text-center mb-4">Creator economy & content moderation expert</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Former VP Trust & Safety at [Platform]</li>
                <li>• Scaled creator tools to 10M+ users</li>
                <li>• Industry thought leader</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Request a Conversation</h2>
          <p className="text-slate-600 text-center mb-12">
            Interested in learning more? Fill out the form below and we'll be in touch.
          </p>

          <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-8 border border-slate-200">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Firm/Organization *</label>
                <input
                  type="text"
                  required
                  value={formData.firm}
                  onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Venture Capital Partners"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Partner, Analyst, etc."
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Why is this a fit? *</label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us about your investment thesis and why you're interested in FanGigs..."
              />
            </div>

            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <i className={`fas ${submitStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Footer Notice */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p className="mb-4">
            <strong className="text-slate-300">Important Notice:</strong> This page is informational and not an offer to sell or the solicitation of an offer to buy securities. Any offering will be made privately to eligible investors and only by definitive documents.
          </p>
          <p className="text-slate-500">
            © {new Date().getFullYear()} FanGigs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
