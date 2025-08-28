'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SignInModal from './SignInModal';
import JoinModal from './JoinModal';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname(); // track route changes

  useEffect(() => {
    setMobileMenuOpen(false); // close menu when route changes
  }, [pathname]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Header profile data:', profileData);
        console.log('Profile headshot_image:', profileData?.headshot_image);
        
        if (error) {
          console.error('Error fetching profile:', error);
        }
        
        setProfile(profileData);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-8 whitespace-nowrap">
          {/* Logo */}
          <Link href="/" className="text-5xl font-extrabold bg-gradient-to-b from-blue-600 via-purple-500 to-red-500 text-transparent bg-clip-text">
            <span translate="no">FANGIGS</span>
          </Link>

          {/* Mobile Hamburger */}
          <div className="sm:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-3xl">
              ☰
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center space-x-4">
            <Link href="/find-work" className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition">Find Work</Link>
            <Link href="/find-talent" className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition">Find Talents</Link>
            <Link href="/post-job" className="text-black font-semibold px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-900 transition">Post a Job</Link>
          </nav>
        </div>

        {/* Desktop User Area */}
        {user && profile ? (
          <div className="hidden sm:flex items-center space-x-4">
            <Link href={profile.type === 'creator' ? '/producer-dashboard' : '/talent-dashboard'}>
              <button className="bg-blue-800 text-white px-4 py-2 rounded font-bold hover:bg-blue-900 transition">Dashboard</button>
            </Link>
            <Link href={`/profile/${profile.vanity_username}`}>
              <Image
                src={profile.headshot_image
                  ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}?t=${Date.now()}`
                  : '/placeholder-avatar.png'}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full border"
                onError={(e) => {
                  console.error('Avatar image failed to load:', e);
                  e.target.src = '/placeholder-avatar.png';
                }}
                onLoad={() => {
                  console.log('Avatar image loaded successfully');
                }}
              />
            </Link>
            <span className="font-medium text-gray-800">Hello {profile.full_name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded transform hover:scale-110 hover:rotate-[360deg] hover:opacity-80 transition-all duration-500 ease-in-out hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-x-2">
            <button onClick={() => setSignInModalOpen(true)} className="text-black font-semibold hover:underline">Sign In</button>
            <button onClick={() => setJoinModalOpen(true)} className="bg-blue-700 text-white px-3 py-2 rounded hover:bg-blue-800">Join</button>
          </div>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pb-4 space-y-3">
           {/* Nav Links */}
          <Link href="/find-work" onClick={() => setMobileMenuOpen(false)} className="block font-semibold text-black hover:underline">Find Work</Link>
          <Link href="/find-talent" onClick={() => setMobileMenuOpen(false)} className="block font-semibold text-black hover:underline">Find Talents</Link>
          <Link href="/post-job" onClick={() => setMobileMenuOpen(false)} className="block font-semibold text-black hover:underline">Post a Job</Link>
          
          {user && profile && (
            <>
              {/* Avatar + Hello */}
              <div className="flex items-center gap-3">
                <Link href={`/profile/${profile.vanity_username}`}>
                  <Image
                    src={profile.headshot_image
                      ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}?t=${Date.now()}`
                      : '/placeholder-avatar.png'}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full border"
                    onError={(e) => {
                      console.error('Mobile avatar image failed to load:', e);
                      e.target.src = '/placeholder-avatar.png';
                    }}
                  />
                </Link>
                <p className="font-semibold text-gray-700">Hello {profile.full_name}</p>
              </div>

              {/* Dashboard */}
              <button
                onClick={() => {
                  const path = profile.type === 'creator' ? '/producer-dashboard' : '/talent-dashboard';
                  window.location.href = path;
                }}
                className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
              >
                Dashboard
              </button>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setSignInModalOpen(false)} 
        openJoinModal={() => setJoinModalOpen(true)} 
      />
      <JoinModal isOpen={isJoinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </header>
  );
}