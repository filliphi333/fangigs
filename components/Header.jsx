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
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        // Handle auth session missing as normal "not logged in" state
        if (userError && userError.name === 'AuthSessionMissingError') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (userError) {
          console.error('Auth error:', userError);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (user) {
          setUser(user);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            // If profile doesn't exist (PGRST116), redirect to edit-profile only for authenticated users
            if (profileError.code === 'PGRST116') {
              showNotification('Please complete your profile setup', 'info');
              setTimeout(() => {
                window.location.href = '/edit-profile';
              }, 2000);
              setLoading(false);
              return;
            }
            // For other profile errors, just log them and continue without profile
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Unexpected error in auth flow:', error);
        // Don't show notifications for auth errors to avoid spamming users
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showNotification('Successfully signed out', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
      showNotification('Error signing out', 'error');
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-8 whitespace-nowrap">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-blue-600 via-purple-500 to-red-500 text-transparent bg-clip-text hover:scale-105 transition-transform"
              aria-label="FanGigs Home"
            >
              <span translate="no">FANGIGS</span>
            </Link>

            {/* Mobile Hamburger */}
            <div className="lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <div className="w-6 h-6 flex flex-col justify-center">
                  <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${
                    mobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                  }`} />
                  <span className={`block w-6 h-0.5 bg-gray-600 mt-1 transition-all ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`} />
                  <span className={`block w-6 h-0.5 bg-gray-600 mt-1 transition-all ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                  }`} />
                </div>
              </button>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1" role="navigation">
              <Link 
                href="/find-work" 
                className="text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Find Work
              </Link>
              <Link 
                href="/find-talent" 
                className="text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Find Talents
              </Link>
              <Link 
                href="/post-job" 
                className="text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Post a Job
              </Link>
            </nav>
          </div>

          {/* Desktop User Area */}
          <div className="hidden lg:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : user && profile ? (
              <>
                {/* Admin Dashboard Button - Only for admin users */}
                {profile.role === 'admin' && (
                  <Link href="/admin-dashboard">
                    <button className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 px-4 py-2 rounded-lg font-bold hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-yellow-300">
                      <span className="relative z-10 flex items-center">
                        <i className="fas fa-crown mr-2 text-yellow-800"></i>
                        Admin Dashboard
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg opacity-30 animate-pulse"></div>
                    </button>
                  </Link>
                )}

                {/* Regular Dashboard Button */}
                <Link href={profile.type === 'creator' ? '/producer-dashboard' : '/talent-dashboard'}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </button>
                </Link>
                <Link 
                  href={`/profile/${profile.vanity_username}`}
                  className="relative group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                >
                  <Image
                    src={profile.headshot_image
                      ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}?t=${Date.now()}`
                      : '/placeholder-avatar.png'}
                    alt={`${profile.full_name}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-gray-200 hover:border-blue-400 transition-colors object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.png';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </Link>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 text-sm">
                    Hello, {profile.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    @{profile.vanity_username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Sign out"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSignInModalOpen(true)} 
                  className="text-gray-700 font-semibold hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setJoinModalOpen(true)} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-4 space-y-4 bg-gray-50 border-t border-gray-200">
            {/* Nav Links */}
            <div className="space-y-2">
              <Link 
                href="/find-work" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-semibold text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg transition-all"
              >
                <i className="fas fa-search mr-2"></i>
                Find Work
              </Link>
              <Link 
                href="/find-talent" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-semibold text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg transition-all"
              >
                <i className="fas fa-users mr-2"></i>
                Find Talents
              </Link>
              <Link 
                href="/post-job" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-semibold text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg transition-all"
              >
                <i className="fas fa-plus-circle mr-2"></i>
                Post a Job
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            ) : user && profile ? (
              <div className="space-y-4 pt-4 border-t border-gray-300">
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg">
                  <Link href={`/profile/${profile.vanity_username}`} onClick={() => setMobileMenuOpen(false)}>
                    <Image
                      src={profile.headshot_image
                        ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}?t=${Date.now()}`
                        : '/placeholder-avatar.png'}
                      alt={`${profile.full_name}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-gray-200 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-avatar.png';
                      }}
                    />
                  </Link>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{profile.full_name}</p>
                    <p className="text-sm text-gray-600">@{profile.vanity_username}</p>
                  </div>
                </div>

                {/* Admin Dashboard Button - Only for admin users */}
                {profile.role === 'admin' && (
                  <Link 
                    href="/admin-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 py-3 rounded-lg font-bold hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg border border-yellow-300 mb-2">
                      <span className="relative z-10 flex items-center justify-center">
                        <i className="fas fa-crown mr-2 text-yellow-800"></i>
                        Admin Dashboard
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg opacity-30 animate-pulse"></div>
                    </button>
                  </Link>
                )}

                {/* Regular Dashboard Button */}
                <Link 
                  href={profile.type === 'creator' ? '/producer-dashboard' : '/talent-dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </button>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-gray-300">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignInModalOpen(true);
                  }} 
                  className="w-full text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-white transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setJoinModalOpen(true);
                  }} 
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <SignInModal 
          isOpen={isSignInModalOpen} 
          onClose={() => setSignInModalOpen(false)} 
          openJoinModal={() => setJoinModalOpen(true)} 
        />
        <JoinModal isOpen={isJoinModalOpen} onClose={() => setJoinModalOpen(false)} />
      </header>
    </>
  );
}