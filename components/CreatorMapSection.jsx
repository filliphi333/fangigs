'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function CreatorMapSection() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchTravelData = async () => {
      const { data, error } = await supabase
        .from('creator_travel_plans')
        .select('id, creator_name, location, lat, lng, start_date, end_date, open_to_collab');

      if (!error && Array.isArray(data)) {
        const formatted = data.map(item => ({
          name: item.creator_name,
          city: item.location,
          lat: item.lat,
          lng: item.lng,
          dates: `${item.start_date} – ${item.end_date}`,
          openToCollab: item.open_to_collab,
        }));
        setMarkers(formatted);
      } else {
        console.error('Error fetching travel data:', error);
        setMarkers([]);
      }
    };
    fetchTravelData();
  }, []);

  return (
    <section className="w-full bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Creator Travel Map</h2>
        <p className="text-center mb-4 text-gray-600">
          See where creators will be filming soon and plan collaborations.
        </p>
        <Map markers={markers} />
      </div>
    </section>
  );
}
