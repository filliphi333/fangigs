'use client';
import { useState } from 'react';

export default function JoinModal({ isOpen, onClose }) {
  const [role, setRole] = useState('talent');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex overflow-hidden relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl">&times;</button>

        {/* Left Side */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center flex-col justify-end p-6 text-white"
          style={{ backgroundImage: "url('/images/neon-sign.jpg')" }}
        >
          <div>
            <h2 className="text-2xl font-bold">Sign up with FanGigs</h2>
            <p className="mt-2 text-sm">Already a member? <a href="#" className="underline">Log in</a></p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-6 space-y-4 bg-[#E8967B] text-white">
          {/* Role Tabs */}
          <div className="flex space-x-4 justify-center mb-4">
            <button
              onClick={() => setRole('talent')}
              className={`px-4 py-2 rounded-full ${role === 'talent' ? 'bg-white text-[#E8967B]' : 'bg-[#eaa68c]'}`}
            >
              Talent
            </button>
            <button
              onClick={() => setRole('creator')}
              className={`px-4 py-2 rounded-full ${role === 'creator' ? 'bg-white text-[#E8967B]' : 'bg-[#eaa68c]'}`}
            >
              Content Creator
            </button>
          </div>

          {/* Social Logins */}
          <div className="flex justify-center space-x-4">
            <button className="p-3 bg-white rounded-full hover:bg-gray-200">
              <img src="/images/google-icon.png" alt="Google" className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white rounded-full hover:bg-gray-200">
              <img src="/images/facebook-icon.png" alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white rounded-full hover:bg-gray-200">
              <img src="/images/apple-icon.png" alt="Apple" className="w-6 h-6" />
            </button>
          </div>

          <hr className="border-white/50" />

          {/* Form */}
          <form className="space-y-4">
            <input type="text" placeholder="First Name" className="w-full border rounded px-3 py-2 text-black" />
            <input type="text" placeholder="Last Name" className="w-full border rounded px-3 py-2 text-black" />
            <input type="password" placeholder="Create Password" className="w-full border rounded px-3 py-2 text-black" />
            {role === 'creator' && (
              <input type="text" placeholder="Phone Number (optional)" className="w-full border rounded px-3 py-2 text-black" />
            )}
            <button type="submit" className="w-full bg-white text-[#E8967B] py-2 rounded font-bold hover:bg-gray-100">
              Sign Up
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-center">
            By choosing to join, I certify I am 18 years old and have read the <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms of Use</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
