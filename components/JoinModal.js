'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function JoinModal({ isOpen, onClose }) {
  const [userType, setUserType] = useState('talent'); // 'talent' or 'creator'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative flex overflow-hidden">
        {/* Left Side - Neon Sign */}
        <div className="w-1/2 hidden md:block">
          <Image
            src="/images/neon-sign.jpg"
            alt="Neon Sign"
            width={600}
            height={700}
            className="object-cover h-full w-full"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
            onClick={onClose}
          >
            ✕
          </button>

          {/* Type Switcher */}
          <div className="mb-6 flex justify-center space-x-4">
            <button
              className={`px-4 py-2 rounded-full font-medium transition ${
                userType === 'talent'
                  ? 'bg-[#E8967BCC] text-white'
                  : 'bg-gray-200 text-black'
              }`}
              onClick={() => setUserType('talent')}
            >
              Talent
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium transition ${
                userType === 'creator'
                  ? 'bg-[#E8967BCC] text-white'
                  : 'bg-gray-200 text-black'
              }`}
              onClick={() => setUserType('creator')}
            >
              Content Creator
            </button>
          </div>

        {/* Social Sign Up */}
<div className="flex justify-center space-x-4 mb-6">
  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer shadow">
    <img src="/images/facebook.jpg" alt="Facebook" className="w-6 h-6" />
  </div>
  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer shadow">
    <img src="/images/google.jpg" alt="Google" className="w-6 h-6" />
  </div>
</div>

          {/* Form */}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const payload = {
                fullName: form.fullName.value,
                email: form.email.value,
                password: form.password.value,
                type: userType,
                phone: form.phone?.value,
                company: form.company?.value,
              };

              const res = await fetch('/api/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              const result = await res.json();
              alert(result.message || 'Joined!');
              onClose();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input name="fullName" type="text" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input name="email" type="email" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input name="password" type="password" required className="w-full p-2 border rounded" />
            </div>

            {userType === 'creator' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number (optional)</label>
                  <input name="phone" type="tel" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company (optional)</label>
                  <input name="company" type="text" className="w-full p-2 border rounded" />
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-[#E8967BCC] text-white py-2 rounded mt-4 hover:opacity-90 transition">
              Join Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
