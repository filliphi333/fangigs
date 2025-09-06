
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import DeactivateAccount from "../../components/DeactivateAccount";

const DEFAULT_COVER_IMAGES = [
  "default1.jpg","default2.jpg","default3.jpg","default4.jpg","default5.jpg",
  "default6.jpg","default7.jpg","default8.jpg","default9.jpg","default10.jpg",
  "default11.jpg","default12.jpg","default13.jpg","default14.jpg","default15.jpg"
];

const COLOR_SCHEMES = {
  solid: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ],
  gradients: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ]
};

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [updating, setUpdating] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const [errors, setErrors] = useState({});
  const [heightUnit, setHeightUnit] = useState('cm');
  const [collabs, setCollabs] = useState([]);
  const [newCollab, setNewCollab] = useState('');
  const [uploadPreview, setUploadPreview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error) {
        setProfile({ 
          ...data, 
          is_public: data.is_public ?? true,
          open_to_messages: data.open_to_messages ?? true
        });
        if (data.collabs) {
          setCollabs(data.collabs);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'full_name':
        if (!value || value.trim().length < 2) {
          newErrors.full_name = 'Full name must be at least 2 characters';
        } else {
          delete newErrors.full_name;
        }
        break;
      case 'vanity_username':
        if (!value) {
          newErrors.vanity_username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.vanity_username = 'Username can only contain letters, numbers, and underscores';
        } else if (value.length < 3) {
          newErrors.vanity_username = 'Username must be at least 3 characters';
        } else {
          delete newErrors.vanity_username;
        }
        break;
      case 'height':
        if (value && (value < 120 || value > 250)) {
          newErrors.height = 'Height must be between 120-250 cm (or 4-8 ft)';
        } else {
          delete newErrors.height;
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setProfile((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    validateField(name, newValue);
  };

  const convertHeight = (value, fromUnit, toUnit) => {
    if (!value) return '';
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'cm' && toUnit === 'ft') {
      return Math.round((value / 30.48) * 10) / 10; // Convert cm to ft
    } else if (fromUnit === 'ft' && toUnit === 'cm') {
      return Math.round(value * 30.48); // Convert ft to cm
    }
    return value;
  };

  const handleHeightUnitChange = (newUnit) => {
    if (profile.height) {
      const convertedHeight = convertHeight(profile.height, heightUnit, newUnit);
      setProfile(prev => ({ ...prev, height: convertedHeight }));
    }
    setHeightUnit(newUnit);
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview for cover image uploads
    if (imageType === "cover_image") {
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    setUploadingImages(prev => ({ ...prev, [imageType]: true }));

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Please log in to upload images");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File too large. Please choose an image under 5MB.");
      }

      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file.");
      }

      const extension = file.name.split(".").pop();
      const path = `${user.id}/${imageType}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ [imageType]: path })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      setProfile(prev => ({ ...prev, [imageType]: path }));
      
      if (imageType === "cover_image") {
        setCoverModalOpen(false);
        setUploadPreview(null);
      }
      
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successMsg.textContent = 'Image uploaded successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorMsg.textContent = error.message;
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
      setUploadPreview(null);
    } finally {
      setUploadingImages(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleCoverSelect = async (filename) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ cover_image: filename })
        .eq("id", user.id);
      
      if (error) throw new Error(`Failed to update cover image: ${error.message}`);
      
      setProfile(prev => ({ ...prev, cover_image: filename }));
      setCoverModalOpen(false);
      setUploadPreview(null);
    } catch (error) {
      console.error('Error updating cover image:', error);
      alert(`Error updating cover image: ${error.message}`);
    }
  };

  const handleColorSchemeSelect = async (colorValue, isGradient = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const coverValue = isGradient ? `gradient:${colorValue}` : `color:${colorValue}`;
      
      const { error } = await supabase
        .from("profiles")
        .update({ cover_image: coverValue })
        .eq("id", user.id);
      
      if (error) throw new Error(`Failed to update cover: ${error.message}`);
      
      setProfile(prev => ({ ...prev, cover_image: coverValue }));
      setCoverModalOpen(false);
      setUploadPreview(null);
    } catch (error) {
      console.error('Error updating cover:', error);
      alert(`Error updating cover: ${error.message}`);
    }
  };

  const addCollab = () => {
    if (newCollab.trim() && !collabs.includes(newCollab.trim())) {
      const updatedCollabs = [...collabs, newCollab.trim()];
      setCollabs(updatedCollabs);
      setProfile(prev => ({ ...prev, collabs: updatedCollabs }));
      setNewCollab('');
    }
  };

  const removeCollab = (index) => {
    const updatedCollabs = collabs.filter((_, i) => i !== index);
    setCollabs(updatedCollabs);
    setProfile(prev => ({ ...prev, collabs: updatedCollabs }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    validateField('full_name', profile.full_name);
    validateField('vanity_username', profile.vanity_username);
    validateField('height', profile.height);
    validateField('phone', profile.phone);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setUpdating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates = {
        full_name: profile.full_name,
        vanity_username: profile.vanity_username,
        bio: profile.bio,
        birthday: profile.birthday,
        height: profile.height,
        gender: profile.gender,
        hair_color: profile.hair_color,
        sexual_orientation: profile.sexual_orientation,
        location: profile.location,
        camera_experience: profile.camera_experience,
        instagram_handle: profile.instagram_handle,
        twitter_handle: profile.twitter_handle,
        snapchat_handle: profile.snapchat_handle,
        is_public: profile.is_public,
        open_to_messages: profile.open_to_messages,
        cover_image: profile.cover_image,
        headshot_image: profile.headshot_image,
        full_body_image_1: profile.full_body_image_1,
        full_body_image_2: profile.full_body_image_2,
        full_body_image_3: profile.full_body_image_3,
        full_body_image_4: profile.full_body_image_4,
        full_body_image_5: profile.full_body_image_5,
        type: profile.type,
        phone: profile.phone,
        company: profile.company,
        collabs: collabs,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert([{ id: user.id, ...updates }], { onConflict: "id" });
      
      if (error) {
        if (error.code === '23505') {
          throw new Error("That username is already taken! Please choose another one.");
        } else {
          throw new Error("Error updating profile: " + error.message);
        }
      }
      
      router.push("/profile/" + updates.vanity_username);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const bucketURL = "https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars";

  const renderCoverPreview = () => {
    if (!profile.cover_image) {
      return (
        <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-600">
          <div className="text-center">
            <i className="fas fa-image text-4xl mb-2"></i>
            <p>No Cover Image</p>
          </div>
        </div>
      );
    }

    if (profile.cover_image.startsWith('color:')) {
      const color = profile.cover_image.replace('color:', '');
      return (
        <div 
          className="w-full h-48 sm:h-64 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <div className="text-center text-white">
            <i className="fas fa-palette text-4xl mb-2"></i>
            <p>Color Cover</p>
          </div>
        </div>
      );
    }

    if (profile.cover_image.startsWith('gradient:')) {
      const gradient = profile.cover_image.replace('gradient:', '');
      return (
        <div 
          className="w-full h-48 sm:h-64 rounded-lg flex items-center justify-center"
          style={{ background: gradient }}
        >
          <div className="text-center text-white">
            <i className="fas fa-palette text-4xl mb-2"></i>
            <p>Gradient Cover</p>
          </div>
        </div>
      );
    }

    if (profile.cover_image.startsWith('default')) {
      return (
        <img
          src={`/images/covers/${profile.cover_image}`}
          alt="Cover"
          className="object-cover object-center w-full h-48 sm:h-64 rounded-lg"
        />
      );
    }

    return (
      <img
        src={`${bucketURL}/${profile.cover_image}`}
        alt="Cover"
        className="object-cover object-center w-full h-48 sm:h-64 rounded-lg"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Edit Profile
        </h1>

        {/* Cover with overlapping Avatar */}
        <div className="mb-6 relative">
          {renderCoverPreview()}

          {/* Avatar */}
          {profile.headshot_image && (
            <img
              src={`${bucketURL}/${profile.headshot_image}`}
              alt="Avatar"
              className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white left-6 -bottom-16 shadow-lg z-10"
            />
          )}

          <button
            type="button"
            className="absolute top-3 right-3 bg-white hover:bg-gray-50 px-4 py-2 text-sm border rounded-lg shadow-md transition-colors"
            onClick={() => setCoverModalOpen(true)}
          >
            <i className="fas fa-camera mr-2"></i>
            Change Cover
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input 
                name="full_name" 
                placeholder="Your real or stage name" 
                value={profile.full_name || ""} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <input 
                name="vanity_username" 
                placeholder="username" 
                value={profile.vanity_username || ""} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vanity_username ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.vanity_username && <p className="text-red-500 text-sm mt-1">{errors.vanity_username}</p>}
              <p className="text-xs text-gray-500 mt-1">This appears in your profile URL</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Account Type *</label>
              <select
                name="type"
                value={profile.type || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Role</option>
                <option value="talent">Talent</option>
                <option value="creator">Producer/Studio/Content Creator</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Switch between Talent and Content Creator roles to access different platform features.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea 
                name="bio" 
                placeholder="Tell us about yourself, your experience, and interests..." 
                value={profile.bio || ""} 
                onChange={handleChange} 
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Share your experience and interests (max 500 characters)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company (Optional)</label>
              <input 
                name="company" 
                placeholder="Your company or agency name" 
                value={profile.company || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
              <input 
                name="phone" 
                type="tel"
                placeholder="+1 (555) 123-4567" 
                value={profile.phone || ""} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Physical Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Birthday</label>
                <input 
                  name="birthday" 
                  type="date" 
                  value={profile.birthday || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    name="height" 
                    min={heightUnit === 'cm' ? "120" : "4"} 
                    max={heightUnit === 'cm' ? "250" : "8"} 
                    step={heightUnit === 'cm' ? "1" : "0.1"}
                    value={profile.height || ""} 
                    onChange={handleChange} 
                    className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.height ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <select
                    value={heightUnit}
                    onChange={(e) => handleHeightUnitChange(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <input 
                  name="gender" 
                  placeholder="Gender" 
                  value={profile.gender || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hair Color</label>
                <input 
                  name="hair_color" 
                  placeholder="Hair Color" 
                  value={profile.hair_color || ""} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sexual Orientation</label>
              <input 
                name="sexual_orientation" 
                placeholder="Sexual Orientation" 
                value={profile.sexual_orientation || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input 
                name="location" 
                placeholder="City, State/Country" 
                value={profile.location || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Where you're based - helps with local casting</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Camera Experience</label>
              <select 
                name="camera_experience" 
                value={profile.camera_experience || ""} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Experience Level</option>
                <option value="No Experience">No Experience</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Pro">Professional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collaborations Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Collaborations</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add collaborator name or @username"
                value={newCollab}
                onChange={(e) => setNewCollab(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCollab())}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCollab}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            
            {collabs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {collabs.map((collab, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                    <span className="text-sm">{collab}</span>
                    <button
                      type="button"
                      onClick={() => removeCollab(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Photos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Head-shot (Avatar)</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, "headshot_image")}
                  disabled={uploadingImages.headshot_image}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadingImages.headshot_image && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {profile.headshot_image && (
                <img 
                  src={`${bucketURL}/${profile.headshot_image}`} 
                  alt="Avatar" 
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-200"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Full-body Photo 1</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, "full_body_image_1")}
                  disabled={uploadingImages.full_body_image_1}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadingImages.full_body_image_1 && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {profile.full_body_image_1 && (
                <img 
                  src={`${bucketURL}/${profile.full_body_image_1}`} 
                  alt="Body 1" 
                  className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Full-body Photo 2</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, "full_body_image_2")}
                  disabled={uploadingImages.full_body_image_2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadingImages.full_body_image_2 && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {profile.full_body_image_2 && (
                <img 
                  src={`${bucketURL}/${profile.full_body_image_2}`} 
                  alt="Body 2" 
                  className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Full-body Photo 3</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, "full_body_image_3")}
                  disabled={uploadingImages.full_body_image_3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadingImages.full_body_image_3 && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {profile.full_body_image_3 && (
                <img 
                  src={`${bucketURL}/${profile.full_body_image_3}`} 
                  alt="Body 3" 
                  className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Full-body Photo 4</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, "full_body_image_4")}
                  disabled={uploadingImages.full_body_image_4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadingImages.full_body_image_4 && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {profile.full_body_image_4 && (
                <img 
                  src={`${bucketURL}/${profile.full_body_image_4}`} 
                  alt="Body 4" 
                  className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Full-body Photo 5</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, "full_body_image_5")}
                  disabled={uploadingImages.full_body_image_5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadingImages.full_body_image_5 && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {profile.full_body_image_5 && (
                <img 
                  src={`${bucketURL}/${profile.full_body_image_5}`} 
                  alt="Body 5" 
                  className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instagram Username</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input 
                  name="instagram_handle" 
                  placeholder="username" 
                  value={profile.instagram_handle || ""} 
                  onChange={handleChange} 
                  className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Twitter Username</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input 
                  name="twitter_handle" 
                  placeholder="username" 
                  value={profile.twitter_handle || ""} 
                  onChange={handleChange} 
                  className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Snapchat Username</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input 
                  name="snapchat_handle" 
                  placeholder="username" 
                  value={profile.snapchat_handle || ""} 
                  onChange={handleChange} 
                  className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Privacy Settings</h2>
          
          <div className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              checked={!profile.is_public} 
              onChange={(e) => setProfile(prev => ({ ...prev, is_public: !e.target.checked }))} 
              className="mt-1"
            />
            <div>
              <label className="font-medium text-gray-800">Make Profile Anonymous</label>
              <p className="text-sm text-gray-600 mt-1">
                Making your profile public significantly increases your chances of getting noticed and hired.
                When your profile is public, producers and casting directors can discover you through search.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              checked={profile.open_to_messages || false} 
              onChange={(e) => setProfile(prev => ({ ...prev, open_to_messages: e.target.checked }))} 
              className="mt-1"
            />
            <div>
              <label className="font-medium text-gray-800">Open to Messages</label>
              <p className="text-sm text-gray-600 mt-1">
                Allow other users to send you direct messages. This helps with networking and collaboration opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end mt-8 gap-3 sm:gap-4">
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={updating || Object.keys(errors).length > 0}
          >
            {updating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              "Save Profile"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/change-password")}
            className="w-full sm:w-auto bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Change Password
          </button>

          <DeactivateAccount />
        </div>
      </form>

      {/* Cover Image Modal */}
      {coverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Choose a Cover</h2>
              <button 
                onClick={() => {
                  setCoverModalOpen(false);
                  setUploadPreview(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Default Images */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Choose from Defaults</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {DEFAULT_COVER_IMAGES.map((img) => (
                  <div key={img} className="relative group">
                    <img
                      src={`/images/covers/${img}`}
                      alt={`Default cover ${img}`}
                      className="rounded-lg shadow cursor-pointer hover:opacity-80 transition-opacity w-full h-24 object-cover border-2 hover:border-blue-400"
                      onClick={() => handleCoverSelect(img)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <i className="fas fa-check text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solid Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Solid Colors</h3>
              <div className="grid grid-cols-5 gap-3">
                {COLOR_SCHEMES.solid.map((color) => (
                  <div
                    key={color}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-colors shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSchemeSelect(color, false)}
                  />
                ))}
              </div>
            </div>

            {/* Gradient Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Gradient Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COLOR_SCHEMES.gradients.map((gradient, index) => (
                  <div
                    key={index}
                    className="w-full h-16 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-colors shadow-sm"
                    style={{ background: gradient }}
                    onClick={() => handleColorSchemeSelect(gradient, true)}
                  />
                ))}
              </div>
            </div>
            
            {/* Upload Custom */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Upload Custom Image</h3>
              
              {/* Preview uploaded image */}
              {uploadPreview && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img 
                    src={uploadPreview} 
                    alt="Upload preview" 
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, "cover_image")} 
                disabled={uploadingImages.cover_image}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {uploadingImages.cover_image && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
