'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function CreatorMapSection() {
  const [markers, setMarkers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userTravelPlans, setUserTravelPlans] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    start_date: '',
    end_date: '',
    open_to_collab: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [previewPin, setPreviewPin] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
  
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const dropdownRef = useRef(null);
  const locationInputRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchTravelData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLocationOptions(false);
        setSelectedOptionIndex(-1);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowLocationOptions(false);
        setSelectedOptionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
      if (profile) {
        fetchUserTravelPlans(profile.full_name);
      }
    }
  };

  const fetchUserTravelPlans = async (creatorName) => {
    const { data, error } = await supabase
      .from('creator_travel_plans')
      .select('*')
      .eq('creator_name', creatorName)
      .order('start_date', { ascending: true });

    if (!error && Array.isArray(data)) {
      setUserTravelPlans(data);
    }
  };

  const fetchTravelData = async () => {
    const { data, error } = await supabase
      .from('creator_travel_plans')
      .select('*')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    if (!error && Array.isArray(data)) {
      const formatted = data.map(item => ({
        name: item.creator_name,
        city: item.location,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lng),
        dates: `${item.start_date} – ${item.end_date}`,
        openToCollab: item.open_to_collab,
      }));
      setMarkers(formatted);
    } else {
      console.error('Error fetching travel data:', error);
      setMarkers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'start_date' || name === 'end_date') {
      const newFormData = {
        ...formData,
        [name]: value
      };
      
      // Auto-adjust end date if it's before start date
      if (name === 'start_date' && formData.end_date && value > formData.end_date) {
        newFormData.end_date = value;
      }
      
      setFormData(newFormData);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Handle location input with debounced search
    if (name === 'location') {
      setSelectedLocation(null);
      setPreviewPin(null);
      setSelectedOptionIndex(-1);
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Set new debounced search
      if (value.trim().length >= 3) {
        searchTimeoutRef.current = setTimeout(() => {
          searchLocations(value);
        }, 300);
      } else {
        setLocationOptions([]);
        setShowLocationOptions(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!showLocationOptions || locationOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedOptionIndex(prev => 
          prev < locationOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedOptionIndex(prev => 
          prev > 0 ? prev - 1 : locationOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedOptionIndex >= 0 && selectedOptionIndex < locationOptions.length) {
          handleLocationSelect(locationOptions[selectedOptionIndex]);
        }
        break;
      case 'Escape':
        setShowLocationOptions(false);
        setSelectedOptionIndex(-1);
        break;
    }
  };

  const handleLocationSelect = (option) => {
    setSelectedLocation(option);
    setFormData(prev => ({
      ...prev,
      location: option.display_name
    }));
    setShowLocationOptions(false);
    setLocationOptions([]);
    setSelectedOptionIndex(-1);
    
    // Set preview pin
    setPreviewPin({
      lat: option.lat,
      lng: option.lng,
      name: "Preview Location",
      city: option.display_name,
      dates: "Preview",
      openToCollab: true,
      isPreview: true
    });
  };

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationOptions([]);
      setShowLocationOptions(false);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=15&addressdetails=1&featuretype=city`,
        { signal: abortControllerRef.current.signal }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const cityResults = data
          .filter(item => {
            const placeTypes = ['city', 'town', 'village', 'municipality', 'administrative'];
            return placeTypes.some(type => 
              item.type === type || 
              item.class === 'place' || 
              item.address?.city || 
              item.address?.town || 
              item.address?.village
            );
          })
          .map(item => {
            const address = item.address || {};
            const city = address.city || address.town || address.village || address.municipality;
            const state = address.state || address.province || address.region;
            const country = address.country;
            
            let displayName = '';
            if (city && state && country) {
              displayName = `${city}, ${state}, ${country}`;
            } else if (city && country) {
              displayName = `${city}, ${country}`;
            } else if (state && country) {
              displayName = `${state}, ${country}`;
            } else {
              const parts = item.display_name.split(',');
              if (parts.length >= 3) {
                displayName = `${parts[0].trim()}, ${parts[1].trim()}, ${parts[parts.length - 1].trim()}`;
              } else {
                displayName = item.display_name;
              }
            }

            return {
              display_name: displayName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              place_id: item.place_id,
              original_name: item.display_name
            };
          })
          .filter((item, index, self) => 
            index === self.findIndex(t => t.display_name === item.display_name)
          )
          .slice(0, 8);

        setLocationOptions(cityResults);
        setShowLocationOptions(cityResults.length > 0);
        setSelectedOptionIndex(-1);
      } else {
        setLocationOptions([]);
        setShowLocationOptions(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Location search error:', error);
        setLocationOptions([]);
        setShowLocationOptions(false);
      }
    }
  };

  const geocodeLocation = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      throw new Error('Location not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to add travel plans');
      return;
    }

    // Validate dates
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      alert('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let coordinates;
      if (selectedLocation) {
        coordinates = {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        };
      } else {
        coordinates = await geocodeLocation(formData.location);
        if (!coordinates) {
          alert('Could not find coordinates for this location. Please select from the search suggestions or try a more specific address.');
          setIsSubmitting(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('creator_travel_plans')
        .insert([{
          creator_name: currentUser.full_name,
          location: formData.location,
          lat: coordinates.lat,
          lng: coordinates.lng,
          start_date: formData.start_date,
          end_date: formData.end_date,
          open_to_collab: formData.open_to_collab
        }]);

      if (error) {
        console.error('Error adding travel plan:', error);
        alert('Failed to add travel plan. Please try again.');
      } else {
        alert('Travel plan added successfully!');
        setFormData({
          location: '',
          start_date: '',
          end_date: '',
          open_to_collab: true
        });
        setSelectedLocation(null);
        setLocationOptions([]);
        setShowLocationOptions(false);
        setPreviewPin(null);
        setShowAddForm(false);
        fetchTravelData();
        fetchUserTravelPlans(currentUser.full_name);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this travel plan?')) {
      return;
    }

    const { error } = await supabase
      .from('creator_travel_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting travel plan:', error);
      alert('Failed to delete travel plan');
    } else {
      alert('Travel plan deleted successfully');
      fetchTravelData();
      fetchUserTravelPlans(currentUser.full_name);
    }
  };

  // Combine markers with preview pin
  const allMarkers = previewPin ? [...markers, previewPin] : markers;

  return (
    <section className="w-full bg-gradient-to-r from-[#9fa5d5] to-[#e8f5c8] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Creator Travel Map</h2>
          <p className="text-gray-600 mb-4">
            See where creators will be filming soon and plan collaborations.
          </p>
          
          {currentUser && (
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
              >
                {showAddForm ? 'Cancel' : 'Add Travel Plan'}
              </button>
            </div>
          )}
        </div>

        {/* Add Travel Plan Form */}
        {showAddForm && currentUser && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Add Your Travel Plan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium mb-1">Location (City, State/Country)</label>
                <input
                  ref={locationInputRef}
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (locationOptions.length > 0) setShowLocationOptions(true);
                  }}
                  placeholder="e.g., Springfield, Illinois"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                
                {/* Location Options Dropdown */}
                {showLocationOptions && locationOptions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-60 overflow-y-auto">
                    {locationOptions.map((option, index) => (
                      <div
                        key={option.place_id || index}
                        onClick={() => handleLocationSelect(option)}
                        className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          index === selectedOptionIndex ? 'bg-pink-50' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {option.display_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Selected Location Confirmation */}
                {selectedLocation && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <span className="text-green-800">✓ Selected: {selectedLocation.display_name}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    min={formData.start_date || undefined}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="open_to_collab"
                  checked={formData.open_to_collab}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm">Open to collaborations</label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Travel Plan'}
              </button>
            </form>
          </div>
        )}

        {/* User's Current Travel Plans */}
        {currentUser && userTravelPlans.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Your Travel Plans</h3>
            <div className="space-y-2">
              {userTravelPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <strong>{plan.location}</strong>
                    <span className="text-gray-600 ml-2">
                      {plan.start_date} – {plan.end_date}
                    </span>
                    <span className="ml-2">
                      {plan.open_to_collab ? "✅ Open to collab" : "❌ Not open to collab"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Map markers={allMarkers} />
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Total active travel plans: {markers.length}</p>
          <p>Showing plans from today onwards</p>
          {previewPin && (
            <p className="text-pink-600">📍 Preview pin shown for selected location</p>
          )}
        </div>
      </div>
    </section>
  );
}