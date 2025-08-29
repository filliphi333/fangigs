
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      question: "What is FanGigs?",
      answer: "FanGigs is a professional platform that connects adult content creators with talent. Whether you're hiring or looking for work, our goal is to make the casting process simple, secure, and transparent.",
      icon: "fas fa-question-circle",
      category: "General"
    },
    {
      question: "Who can join FanGigs?",
      answer: "Anyone over 18 years old can join — models, photographers, producers, editors, and more. We welcome all professionals in the adult content industry.",
      icon: "fas fa-users",
      category: "Getting Started"
    },
    {
      question: "Is my profile visible to everyone?",
      answer: "No. You choose whether to make your profile public or stay anonymous. Anonymous profiles are only visible when applying for jobs. You have full control over your privacy settings.",
      icon: "fas fa-eye-slash",
      category: "Privacy"
    },
    {
      question: "How do I apply for a job?",
      answer: "Once your profile is created, you can browse open jobs on the 'Find Work' page and apply with one click. Make sure your profile is complete for the best results.",
      icon: "fas fa-briefcase",
      category: "Jobs"
    },
    {
      question: "How do producers find talent?",
      answer: "Producers can search using filters like gender, age, tags, and location. They can invite talent directly through the platform or post jobs and wait for applications.",
      icon: "fas fa-search",
      category: "For Creators"
    },
    {
      question: "Is FanGigs free to use?",
      answer: "Basic features are free for all users. We may introduce premium features in the future, but core functionality will always remain accessible.",
      icon: "fas fa-dollar-sign",
      category: "Pricing"
    },
    {
      question: "How do payments work?",
      answer: "FanGigs facilitates connections, but payments are handled directly between users. We recommend discussing payment terms before starting any work.",
      icon: "fas fa-credit-card",
      category: "Payments"
    },
    {
      question: "What safety measures are in place?",
      answer: "We have profile verification, reporting systems, and community guidelines. Always meet in safe locations and trust your instincts when working with new people.",
      icon: "fas fa-shield-alt",
      category: "Safety"
    }
  ];

  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>FAQ - Frequently Asked Questions | FanGigs</title>
        <meta name="description" content="Get answers to frequently asked questions about FanGigs, the professional platform for adult content creators and talent." />
      </head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation Breadcrumb */}
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Home
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <i className="fas fa-question-circle mr-3"></i>
              FAQ
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Everything you need to know about FanGigs
            </p>
            <p className="text-lg text-blue-200 mt-4 max-w-2xl mx-auto">
              Can't find what you're looking for? <a href="mailto:contact@fan-gigs.com" className="underline hover:text-white">Contact our support team</a>
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  <i className="fas fa-list mr-2 text-blue-600"></i>
                  Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button
                        onClick={() => {
                          const categoryItems = faqData
                            .map((item, idx) => item.category === category ? idx : -1)
                            .filter(idx => idx !== -1);
                          setOpenItems(new Set(categoryItems));
                        }}
                        className="text-left w-full px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
                
                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link href="/post-job" className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Post a Job
                    </Link>
                    <Link href="/find-work" className="block w-full border border-blue-600 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                      Find Work
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-gray-600">
                    Click on any question to expand the answer. Use the categories on the left to filter questions.
                  </p>
                </div>

                <div className="space-y-4">
                  {faqData.map((item, index) => (
                    <div
                      key={index}
                      className={`border border-gray-200 rounded-xl transition-all duration-200 ${
                        openItems.has(index) ? 'border-blue-300 shadow-md' : 'hover:border-gray-300'
                      }`}
                    >
                      <button
                        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-xl"
                        onClick={() => toggleItem(index)}
                        aria-expanded={openItems.has(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm ${
                              openItems.has(index) ? 'bg-blue-600' : 'bg-gray-400'
                            }`}>
                              <i className={item.icon}></i>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {item.question}
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <div className={`transform transition-transform duration-200 text-gray-400 ${
                            openItems.has(index) ? 'rotate-180' : ''
                          }`}>
                            <i className="fas fa-chevron-down text-lg"></i>
                          </div>
                        </div>
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${
                        openItems.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-6 pb-6">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 ml-14">
                            <p className="text-gray-700 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    <i className="fas fa-life-ring mr-2"></i>
                    Still Need Help?
                  </h3>
                  <p className="text-blue-100 mb-6">
                    Our support team is here to help with any questions not covered here.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:contact@fan-gigs.com"
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <i className="fas fa-envelope mr-2"></i>
                      Email Support
                    </a>
                    <Link href="/about">
                      <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                        <i className="fas fa-info-circle mr-2"></i>
                        Learn More
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
