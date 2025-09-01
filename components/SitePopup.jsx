
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SitePopup = () => {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('type, created_at')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    
    getUser();
  }, []);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const now = new Date().toISOString();
        
        // Get all active popups that should be shown now
        const { data: popups, error } = await supabase
          .from('admin_popups')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', now)
          .gte('end_date', now)
          .order('priority', { ascending: false });

        if (error) {
          console.error('Error fetching popups:', error);
          return;
        }

        if (!popups || popups.length === 0) return;

        // Filter popups based on target audience
        const eligiblePopups = popups.filter(popup => {
          return shouldShowPopup(popup, user, userProfile);
        });

        if (eligiblePopups.length === 0) return;

        // Get the highest priority popup that hasn't been dismissed
        for (const popup of eligiblePopups) {
          const dismissKey = `popup_dismissed_${popup.id}`;
          const isDismissed = localStorage.getItem(dismissKey);
          
          if (!isDismissed) {
            setPopup(popup);
            setIsVisible(true);
            
            // Track impression
            trackPopupImpression(popup.id);
            break;
          }
        }
      } catch (err) {
        console.error('Error fetching popup:', err);
      }
    };

    fetchActivePopup();
  }, [user, userProfile]);

  const shouldShowPopup = (popup, user, userProfile) => {
    const { target_audience, region } = popup;

    switch (target_audience) {
      case 'logged-out':
        return !user;
      
      case 'new-users':
        if (!user || !userProfile) return false;
        const accountAge = new Date() - new Date(userProfile.created_at);
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        return accountAge < thirtyDaysInMs;
      
      case 'talents':
        return user && userProfile?.type === 'talent';
      
      case 'creators':
        return user && userProfile?.type === 'creator';
      
      case 'region-specific':
        // This would require additional logic to detect user region
        // For now, we'll show to all users if region is specified
        return true;
      
      case 'all':
      default:
        return true;
    }
  };

  const trackPopupImpression = async (popupId) => {
    try {
      // Track impression in database
      await supabase.from('popup_analytics').insert({
        popup_id: popupId,
        event_type: 'impression',
        user_id: user?.id || null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking impression:', err);
    }
  };

  const trackPopupDismiss = async (popupId) => {
    try {
      // Track dismiss in database
      await supabase.from('popup_analytics').insert({
        popup_id: popupId,
        event_type: 'dismiss',
        user_id: user?.id || null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking dismiss:', err);
    }
  };

  const handleDismiss = () => {
    if (popup) {
      // Store dismissal in localStorage
      localStorage.setItem(`popup_dismissed_${popup.id}`, 'true');
      
      // Track dismiss event
      trackPopupDismiss(popup.id);
      
      // Hide popup
      setIsVisible(false);
      setPopup(null);
    }
  };

  const handleButtonClick = async () => {
    if (popup) {
      // Track button click
      try {
        await supabase.from('popup_analytics').insert({
          popup_id: popup.id,
          event_type: 'click',
          user_id: user?.id || null,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error tracking click:', err);
      }

      // Open URL if provided
      if (popup.button_url) {
        window.open(popup.button_url, '_blank');
      }
    }
  };

  const getPopupIcon = (type) => {
    const icons = {
      announcement: 'fas fa-bullhorn',
      maintenance: 'fas fa-tools',
      holiday: 'fas fa-gift',
      feature: 'fas fa-star',
      warning: 'fas fa-exclamation-triangle',
      promotion: 'fas fa-percent'
    };
    return icons[type] || 'fas fa-info-circle';
  };

  if (!isVisible || !popup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden animate-fade-in"
        style={{
          backgroundColor: popup.background_color || '#FFFFFF',
          color: popup.text_color || '#000000'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center justify-center"
          style={{ color: popup.text_color || '#000000' }}
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{
                backgroundColor: popup.text_color || '#000000',
                color: popup.background_color || '#FFFFFF'
              }}
            >
              <i className={`${getPopupIcon(popup.type)} text-lg`}></i>
            </div>
            <h3 className="text-xl font-bold">{popup.title}</h3>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {popup.content}
            </p>
          </div>

          {/* Button */}
          {popup.button_text && (
            <div className="flex justify-center">
              <button
                onClick={handleButtonClick}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg transform hover:scale-105"
                style={{
                  backgroundColor: popup.text_color || '#000000',
                  color: popup.background_color || '#FFFFFF'
                }}
              >
                {popup.button_text}
              </button>
            </div>
          )}

          {/* Priority indicator */}
          {popup.priority >= 3 && (
            <div className="absolute top-2 left-2">
              <span 
                className="px-2 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: popup.text_color || '#000000',
                  color: popup.background_color || '#FFFFFF'
                }}
              >
                {popup.priority >= 4 ? '🚨 URGENT' : '⚠️ HIGH'}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SitePopup;
