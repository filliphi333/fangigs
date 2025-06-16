'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Make sure this is the correct path

const Profile = ({ username }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
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

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        {/* Headshot Image */}
        <img
          src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${profile.headshot_image}`}
          alt={profile.full_name}
          className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
        />

        {/* Full Name */}
        <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>

        {/* Bio */}
        {profile.bio && <p className="mb-4">{profile.bio}</p>}

        {/* Other Profile Information */}
        <div className="mb-6">
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Sexual Orientation:</strong> {profile.sexual_orientation}</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
        </div>

        {/* Additional Sections */}
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
    </div>
  );
};

export default Profile;
