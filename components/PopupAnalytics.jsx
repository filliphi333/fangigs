
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PopupAnalytics = ({ popupId }) => {
  const [analytics, setAnalytics] = useState({
    impressions: 0,
    dismissals: 0,
    clicks: 0,
    dismissRate: 0,
    clickRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!popupId) return;
      
      try {
        setLoading(true);
        
        // Get analytics data
        const { data, error } = await supabase
          .from('popup_analytics')
          .select('event_type')
          .eq('popup_id', popupId);

        if (error) throw error;

        const impressions = data.filter(d => d.event_type === 'impression').length;
        const dismissals = data.filter(d => d.event_type === 'dismiss').length;
        const clicks = data.filter(d => d.event_type === 'click').length;

        const dismissRate = impressions > 0 ? (dismissals / impressions * 100).toFixed(1) : 0;
        const clickRate = impressions > 0 ? (clicks / impressions * 100).toFixed(1) : 0;

        setAnalytics({
          impressions,
          dismissals,
          clicks,
          dismissRate: parseFloat(dismissRate),
          clickRate: parseFloat(clickRate)
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [popupId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-16 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
      <div className="bg-blue-50 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">{analytics.impressions}</div>
        <div className="text-xs text-blue-500">Impressions</div>
      </div>
      <div className="bg-yellow-50 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-yellow-600">{analytics.dismissals}</div>
        <div className="text-xs text-yellow-500">Dismissals</div>
      </div>
      <div className="bg-green-50 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">{analytics.clicks}</div>
        <div className="text-xs text-green-500">Clicks</div>
      </div>
      <div className="bg-red-50 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-red-600">{analytics.dismissRate}%</div>
        <div className="text-xs text-red-500">Dismiss Rate</div>
      </div>
      <div className="bg-purple-50 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">{analytics.clickRate}%</div>
        <div className="text-xs text-purple-500">Click Rate</div>
      </div>
    </div>
  );
};

export default PopupAnalytics;
