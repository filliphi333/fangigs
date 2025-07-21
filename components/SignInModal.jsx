'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignInModal({ isOpen, onClose, openJoinModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setErrorMsg('Could not get user info after sign-in.');
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('type')
      .eq('id', userData.user.id)
      .single();

    // 👇 Redirect intent logic
    const redirectTo = localStorage.getItem('redirect_after_login');
    if (redirectTo) {
      localStorage.removeItem('redirect_after_login'); // Clean it up
      router.push(redirectTo);
      setLoading(false);
      onClose();
      return;
    }

    // 👇 Default fallback
    if (profileError || !profileData) {
      router.push('/edit-profile');
    } else {
      const userType = profileData.type;
      if (userType === 'creator') {
        router.push('/producer-dashboard');
      } else {
        router.push('/talent-dashboard');
      }
    }

    setLoading(false);
    onClose();
  };

  return (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 px-4">
  <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex flex-col sm:flex-row overflow-hidden relative">
    {/* Left Side - Sign In Form */}
    <div className="w-full sm:w-1/2 p-8 bg-white flex flex-col justify-center relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
        ✕
      </button>
      <h2 className="text-3xl font-bold text-black mb-6">Sign In</h2>
      <form onSubmit={handleSignIn} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border-2 border-[#E8967B] bg-white rounded-md focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border-2 border-[#E8967B] bg-white rounded-md focus:outline-none"
        />
        <div className="text-sm">
          <a href="/forgot-password" className="text-blue-900 font-bold hover:underline">Forgot Password?</a>
        </div>
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E8967B] text-white font-bold py-3 rounded-md hover:opacity-90 transition"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>

    {/* Right Side - Welcome Text */}
    <div className="w-full sm:w-1/2 bg-[#E8967B] text-white p-8 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
      <p className="text-center mb-6">
        We're glad to see you again. <br />
        Sign in to manage your gigs, <br />
        update your profile, and connect!
      </p>
      <button
        onClick={() => {
          onClose();
          openJoinModal();
        }}
        className="bg-white text-black font-bold px-4 py-2 rounded hover:opacity-90 transition"
      >
        Not a member? <span className="font-bold">Join Now</span>
      </button>
    </div>
  </div>
</div>
  );
}
