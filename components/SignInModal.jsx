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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSocialSignIn = async (provider) => {
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
    // Note: OAuth will redirect to the provider, so we don't need to handle success here
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

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
 <div 
   className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 px-4"
   onClick={handleBackdropClick}
 >
  <div 
    className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex flex-col sm:flex-row overflow-hidden relative"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Left Side - Sign In Form */}
    <div className="w-full sm:w-1/2 p-8 bg-white flex flex-col justify-center relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
        ✕
      </button>
      <h2 className="text-3xl font-bold text-black mb-6">Sign In</h2>
      
      {/* Social Login Buttons */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          disabled={loading}
          aria-label="Sign in with Google"
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <img src="/images/google.png" alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialSignIn('facebook')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <img src="/images/facebook.webp" alt="Facebook" className="w-5 h-5 mr-3" />
          Continue with Facebook
        </button>
        <button
          type="button"
          onClick={() => handleSocialSignIn('twitter')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-[#1DA1F2] text-sm font-medium text-white hover:bg-[#1A91DA] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Continue with Twitter
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
        </div>
      </div>

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
