"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 text-white py-12 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">FanGigs - Find and post adult casting gigs professionally</h2>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="text-red-400 hover:text-red-600 transition">X</a>
          <a href="#" className="text-red-400 hover:text-red-600 transition">Facebook</a>
        </div>
        <div className="mb-6">
          <p>Contact us at <a href="mailto:contact@fan-gigs.com" className="text-red-400 hover:text-red-600">contact@fan-gigs.com</a></p>
        </div>
        <div className="mb-6">
          <Link href="/about" className="text-red-400 hover:text-red-600 mx-2">About</Link>
          <Link href="/privacy" className="text-red-400 hover:text-red-600 mx-2">Privacy Policy</Link>
          <Link href="/terms" className="text-red-400 hover:text-red-600 mx-2">Terms of Use</Link>
        </div>
        <form className="max-w-sm mx-auto">
          <label htmlFor="newsletter" className="block text-sm font-medium text-gray-300 mb-2">Subscribe to our newsletter</label>
          <div className="flex">
            <input type="email" id="newsletter" name="newsletter" placeholder="Enter your email" className="w-full px-4 py-2 rounded-l bg-gray-800 border border-gray-600 text-white placeholder-gray-400" />
            <button type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-r">Subscribe</button>
          </div>
        </form>
        <p className="text-gray-500 text-sm mt-8">© {new Date().getFullYear()} FanGigs. All rights reserved.</p>
      </div>
    </footer>
  );
}
