'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) console.error(error);
      else setProfile(data || {});
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) alert('Error updating profile');
    else alert('Profile updated!');
    setUpdating(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          name="bio"
          placeholder="Short bio..."
          value={profile.bio || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input name="age" placeholder="Age" value={profile.age || ''} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="height" placeholder="Height" value={profile.height || ''} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="gender" placeholder="Gender" value={profile.gender || ''} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="hair_color" placeholder="Hair Color" value={profile.hair_color || ''} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="sexual_orientation" placeholder="Sexual Orientation" value={profile.sexual_orientation || ''} onChange={handleChange} className="w-full p-2 border rounded" />

        <label className="flex items-center">
          <input type="checkbox" name="camera_experience" checked={profile.camera_experience || false} onChange={handleChange} className="mr-2" />
          Experienced on Camera
        </label>

        <input name="twitter" placeholder="@Twitter" value={profile.twitter || ''} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="instagram" placeholder="@Instagram" value={profile.instagram || ''} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="snapchat" placeholder="@Snapchat" value={profile.snapchat || ''} onChange={handleChange} className="w-full p-2 border rounded" />

        <label className="flex items-center">
          <input type="checkbox" name="is_public" checked={profile.is_public || false} onChange={handleChange} className="mr-2" />
          Make Profile Public
        </label>

        <button type="submit" disabled={updating} className="bg-[#E8967B] text-white px-4 py-2 rounded hover:opacity-90">
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}
