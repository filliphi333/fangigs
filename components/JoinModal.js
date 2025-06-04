'use client';
import { useState } from 'react';

export default function JoinModal({ isOpen, onClose }) {
  const [userType, setUserType] = useState('talent'); // 'talent' or 'creator'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Type Switcher */}
        <div className="mb-4 flex justify-center space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              userType === 'talent' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setUserType('talent')}
          >
            Talent
          </button>
          <button
            className={`px-4 py-2 rounded ${
              userType === 'creator' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setUserType('creator')}
          >
            Content Creator
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required className="w-full p-2 border rounded" />
          </div>

          {userType === 'creator' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number (optional)</label>
                <input type="tel" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700">
            Join Now
          </button>
        </form>
      </div>
    </div>
  );
}
