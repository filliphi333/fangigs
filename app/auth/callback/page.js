
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_failed');
          return;
        }

        if (data.session) {
          const user = data.session.user;
          
          // Check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError);
          }

          // If no profile exists, create one
          if (!profileData) {
            const newProfile = {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
              type: 'talent', // Default type, user can change later
              created_at: new Date().toISOString(),
              is_public: false, // Start with private profile
              phone: null,
              company: null,
              bio: null,
              age: null,
            };

            const { error: createError } = await supabase
              .from('profiles')
              .insert([newProfile]);

            if (createError) {
              console.error('Profile creation error:', createError);
            }
          }

          // Check redirect intent
          const redirectTo = localStorage.getItem('redirect_after_login');
          if (redirectTo) {
            localStorage.removeItem('redirect_after_login');
            router.push(redirectTo);
            return;
          }

          // Default redirect based on profile type
          if (profileData?.type === 'creator') {
            router.push('/producer-dashboard');
          } else if (profileData?.type === 'talent') {
            router.push('/talent-dashboard');
          } else {
            router.push('/edit-profile');
          }
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        router.push('/?error=auth_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8967B] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
