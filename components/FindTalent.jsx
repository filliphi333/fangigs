'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

/* ── Predefined tag list (expand as you like) ── */
const TAG_OPTIONS = [
  'Model', 'Photographer', 'Cameraman', 'Editor',
  'Makeup Artist', 'BDSM Friendly', 'Feet', 'Trans'
];

/* ───────────────────────────────────────────── */
export default function FindTalent() {
  const [models, setModels]      = useState([]);
  const [gender,  setGender]     = useState('');
  const [search,  setSearch]     = useState('');      // free-text search
  const [tags,    setTags]       = useState([]);      // array of selected tags
  const [loading, setLoading]    = useState(false);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 100 });

  /* ── toggle tag checkboxes ── */
  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

 const fetchModels = async () => {
  setLoading(true);

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .eq('type', 'talent');

  if (gender) query = query.eq('gender', gender);

  if (search.trim()) {
    query = query.ilike('sexual_orientation', `%${search.trim()}%`);
  }

  if (tags.length) {
    query = query.contains('tags', tags); // Supabase array match
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching talents:', error);
    setLoading(false);
    return;
  }

  // ✅ Apply age filtering with null included
  let filtered = data;
  if (ageRange.min && ageRange.max) {
    filtered = filtered.filter(model =>
      model.age === null ||
      (model.age >= ageRange.min && model.age <= ageRange.max)
    );
  }

  // ✅ Push null ages to the end
  filtered.sort((a, b) => {
    if (a.age === null) return 1;
    if (b.age === null) return -1;
    return a.age - b.age;
  });

  setModels(filtered);
  setLoading(false);
};

  /* initial load */
  useEffect(() => { fetchModels(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex max-w-7xl mx-auto py-8 px-4 gap-6">
      {/* ───────── Sidebar Filters ───────── */}
      <aside className="w-full md:w-64 shrink-0 p-4 bg-gray-100 rounded shadow">
        <h3 className="font-bold mb-3">Gender</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {['male','female','non-binary'].map(opt => (
            <button
              key={opt}
              onClick={() => setGender(gender === opt ? '' : opt)}
              className={`px-3 py-1 rounded-full text-sm border
                ${gender === opt ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <h3 className="font-bold mb-3">Tags</h3>
        <div className="space-y-1 mb-4 max-h-40 overflow-y-auto pr-1">
          {TAG_OPTIONS.map(tag => (
            <label key={tag} className="flex items-center text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={tags.includes(tag)}
                onChange={() => toggleTag(tag)}
              />
              {tag}
            </label>
          ))}
        </div>

        <h3 className="font-bold mb-2">Age Range</h3>
<div className="flex items-center gap-2 mb-4">
  <input
    type="number"
    min="18"
    max="100"
    value={ageRange.min}
    onChange={(e) => setAgeRange(prev => ({ ...prev, min: Number(e.target.value) }))}
    className="w-20 p-1 border rounded text-sm"
    placeholder="Min"
  />
  <span>-</span>
  <input
    type="number"
    min="18"
    max="100"
    value={ageRange.max}
    onChange={(e) => setAgeRange(prev => ({ ...prev, max: Number(e.target.value) }))}
    className="w-20 p-1 border rounded text-sm"
    placeholder="Max"
  />
</div>

        <h3 className="font-bold mb-2">Sexual Orientation (search)</h3>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="e.g. gay, bi, pan"
          className="w-full p-2 border rounded mb-4 text-sm"
        />

        <button
          onClick={fetchModels}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          Apply Filters
        </button>
      </aside>

      {/* ───────── Talent Grid ───────── */}
      <section className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Find Talents</h1>

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : models.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {models.map(model => (
              <Link key={model.id} href={`/profile/${model.vanity_username}`} className="text-center">
                <img
                  src={model.headshot_image
                    ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${model.headshot_image}`
                    : '/placeholder-avatar.png'}
                  alt={model.full_name}
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-2"
                />
                <h3 className="font-semibold">{model.full_name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <p>No talents match your filters.</p>
        )}
      </section>
    </div>
  );
}
