'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Ensure this path is correct
import Link from 'next/link';

export default function FindTalent() {
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({
    gender: '',
    sexualPreference: '',
  });

  // Fetch models that have public profiles
  const fetchModels = async () => {
    let query = supabase.from('profiles').select('*').eq('is_public', true); // Filter only public profiles

    // Apply filters based on user selection
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    if (filters.sexualPreference) {
      query = query.eq('sexual_orientation', filters.sexualPreference);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching models:', error);
    } else {
      setModels(data);
    }
  };

  // Fetch models when filters change
  useEffect(() => {
    fetchModels();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Find Talents</h1>

      {/* Filters */}
      <div className="mb-6">
        <label className="mr-2">Gender:</label>
        <select
          name="gender"
          onChange={handleFilterChange}
          value={filters.gender}
          className="p-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
        </select>

        <label className="ml-4 mr-2">Sexual Preference:</label>
        <select
          name="sexualPreference"
          onChange={handleFilterChange}
          value={filters.sexualPreference}
          className="p-2 border rounded"
        >
          <option value="">Select Preference</option>
          <option value="heterosexual">Heterosexual</option>
          <option value="homosexual">Homosexual</option>
          <option value="bisexual">Bisexual</option>
          <option value="pansexual">Pansexual</option>
        </select>
      </div>

      {/* Talent Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {models.length > 0 ? (
          models.map((model) => (
            <div key={model.id} className="text-center">
              {/* Link to model's profile page */}
              <Link href={`/profile/${model.vanity_username}`}>
                <img
                  src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${model.headshot_image}`}
                  alt={model.full_name}
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-2"
                />
                <h3 className="font-bold">{model.full_name}</h3>
              </Link>
            </div>
          ))
        ) : (
          <p>No models found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}
