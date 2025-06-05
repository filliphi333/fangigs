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
            className={`px-4 py-2 rounded font-medium transition ${
              userType === 'talent'
                ? 'bg-darkPeach text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setUserType('talent')}
          >
            Talent
          </button>
          <button
            className={`px-4 py-2 rounded font-medium transition ${
              userType === 'creator'
                ? 'bg-darkPeach text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setUserType('creator')}
          >
            Content Creator
          </button>
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

          <button
            type="submit"
            className="w-full bg-darkPeach text-white py-2 rounded mt-4 hover:opacity-90 transition"
          >
            Join Now
          </button>
        </form>
      </div>
    </div>
  );
}
