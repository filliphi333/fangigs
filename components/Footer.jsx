
"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
  // Contact form states
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, subject, message } = contactForm;
    
    if (!name || !email || !subject || !message) {
      setContactStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }

    if (!email.includes("@")) {
      setContactStatus({ type: "error", message: "Please enter a valid email address" });
      return;
    }

    setIsContactSubmitting(true);
    
    try {
      // Insert contact submission into database
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          ip_address: null, // Could be populated with actual IP if needed
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
        });

      if (error) {
        throw error;
      }
      
      setContactStatus({ 
        type: "success", 
        message: "Thank you for your message! We'll get back to you within 24 hours." 
      });
      
      // Reset form
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setContactStatus({ 
        type: "error", 
        message: "Something went wrong. Please try again or email us directly at contact@fan-gigs.com" 
      });
    } finally {
      setIsContactSubmitting(false);
      setTimeout(() => setContactStatus(null), 7000);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setSubscriptionStatus({ type: "error", message: "Please enter a valid email address" });
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Here you would integrate with your newsletter service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscriptionStatus({ 
        type: "success", 
        message: "Thanks for subscribing! Check your email for confirmation." 
      });
      setEmail("");
    } catch (error) {
      setSubscriptionStatus({ 
        type: "error", 
        message: "Something went wrong. Please try again." 
      });
    } finally {
      setIsSubscribing(false);
      setTimeout(() => setSubscriptionStatus(null), 5000);
    }
  };

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "X (Twitter)",
      url: "https://x.com/FanGigsOfficial",
      icon: "fab fa-x-twitter",
      color: "hover:text-gray-300"
    },
    {
      name: "Facebook",
      url: "#",
      icon: "fab fa-facebook-f",
      color: "hover:text-blue-400"
    },
    {
      name: "Instagram",
      url: "#",
      icon: "fab fa-instagram",
      color: "hover:text-pink-400"
    },
    {
      name: "LinkedIn",
      url: "#",
      icon: "fab fa-linkedin-in",
      color: "hover:text-blue-300"
    }
  ];

  const quickLinks = [
    { href: "/find-work", label: "Find Work", icon: "fas fa-search" },
    { href: "/find-talent", label: "Find Talent", icon: "fas fa-users" },
    { href: "/post-job", label: "Post a Job", icon: "fas fa-plus-circle" },
  ];

  const legalLinks = [
    { href: "/about", label: "About Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-4">
                FANGIGS
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Professional platform connecting adult content creators with talents, collaborators, and opportunities.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <i className="fas fa-envelope w-5"></i>
                <a 
                  href="mailto:contact@fan-gigs.com" 
                  className="hover:text-white transition-colors duration-300"
                >
                  contact@fan-gigs.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <i className="fas fa-headset w-5"></i>
                <span>24/7 Support Available</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-link text-gray-400"></i>
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 group"
                  >
                    <i className={`${link.icon} w-4 text-gray-500 group-hover:text-gray-300`}></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-shield-alt text-gray-400"></i>
              Legal & Support
            </h3>
            <ul className="space-y-4">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-envelope text-gray-400"></i>
              Contact Us
            </h3>
            <p className="text-gray-400 mb-6">
              Have questions or need support? Send us a message and we'll get back to you.
            </p>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name" 
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  disabled={isContactSubmitting}
                  required
                />
                <i className="fas fa-user absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              </div>
              
              <div className="relative">
                <input 
                  type="email" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email" 
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  disabled={isContactSubmitting}
                  required
                />
                <i className="fas fa-envelope absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject" 
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  disabled={isContactSubmitting}
                  required
                />
                <i className="fas fa-tag absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              </div>

              <div className="relative">
                <textarea 
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Your message" 
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 resize-none"
                  disabled={isContactSubmitting}
                  required
                />
                <i className="fas fa-comment absolute right-3 top-4 text-gray-500"></i>
              </div>
              
              <button 
                type="submit" 
                disabled={isContactSubmitting || !contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isContactSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Contact Status */}
            {contactStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                contactStatus.type === 'success' 
                  ? 'bg-green-900/50 border border-green-700 text-green-300' 
                  : 'bg-red-900/50 border border-red-700 text-red-300'
              }`}>
                <i className={`${contactStatus.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'} mr-2`}></i>
                {contactStatus.message}
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-newspaper text-gray-400"></i>
              Stay Updated
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest industry news and platform updates delivered to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  disabled={isSubscribing}
                  aria-label="Email address for newsletter"
                />
                <i className="fas fa-envelope absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubscribing || !email}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Subscribe
                  </>
                )}
              </button>
            </form>

            {/* Subscription Status */}
            {subscriptionStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                subscriptionStatus.type === 'success' 
                  ? 'bg-green-900/50 border border-green-700 text-green-300' 
                  : 'bg-red-900/50 border border-red-700 text-red-300'
              }`}>
                <i className={`${subscriptionStatus.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'} mr-2`}></i>
                {subscriptionStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Social Links */}
            <div className="flex items-center gap-6">
              <span className="text-gray-400 font-medium">Follow us:</span>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 ${social.color} hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                    aria-label={social.name}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-gray-500 text-sm">
                © {currentYear} FanGigs. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Professional adult industry platform
              </p>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                24/7
              </div>
              <div className="text-sm text-gray-500">Platform Uptime</div>
            </div>
            <div className="group">
              <div className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                100%
              </div>
              <div className="text-sm text-gray-500">Secure Transactions</div>
            </div>
            <div className="group">
              <div className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                18+
              </div>
              <div className="text-sm text-gray-500">Verified Users Only</div>
            </div>
            <div className="group">
              <div className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                Pro
              </div>
              <div className="text-sm text-gray-500">Industry Focus</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
