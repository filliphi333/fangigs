// app/profile/[username].js

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Ensure this path is correct
import { useRouter } from 'next/router'; // Correct import for Next.js routing

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query; // Get the username from the URL
  const [profile, setProfile] = useState(null);
  console.log('Username:', username);  // Check if it's correctly captured

  useEffect(() => {
    if (username) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('vanity_username', username)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      };

      fetchProfile();
    }
  }, [username]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{profile.full_name}</h1>
      <img
        src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}`}
        alt={profile.full_name}
        className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
      />
      <p>{profile.bio}</p>
      <div>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Sexual Orientation:</strong> {profile.sexual_orientation}</p>
        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
      </div>

      {/* Display different sections based on the user type */}
      {profile.type === 'creator' ? (
        <div>
          <h2 className="text-2xl font-bold mt-8">Producer Information</h2>
          <p>This is a producer profile. You can showcase job listings, collaborations, etc.</p>
          {/* Add producer-specific content here */}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mt-8">Talent Information</h2>
          <p>This is a talent profile. You can showcase portfolios, work experience, etc.</p>
          {/* Add talent-specific content here */}
        </div>
      )}
    </div>
  );
}
