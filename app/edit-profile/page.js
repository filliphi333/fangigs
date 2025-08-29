"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const DEFAULT_COVER_IMAGES = [
  "default1.jpg","default2.jpg","default3.jpg","default4.jpg","default5.jpg",
  "default6.jpg","default7.jpg","default8.jpg","default9.jpg","default10.jpg",
  "default11.jpg","default12.jpg","default13.jpg","default14.jpg","default15.jpg"
];

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [updating, setUpdating] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const [errors, setErrors] = useState({});
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
        setProfile({ ...data, is_public: data.is_public ?? true });
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
          newErrors.height = 'Height must be between 120-250 cm';
        } else {
          delete newErrors.height;
        }
        break;
      case 'instagram_handle':
      case 'twitter_handle':
      case 'snapchat_handle':
        if (value && !value.startsWith('http')) {
          newErrors[name] = 'Please enter a complete URL starting with http:// or https://';
        } else {
          delete newErrors[name];
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

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set uploading state
    setUploadingImages(prev => ({ ...prev, [imageType]: true }));

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Please log in to upload images");
      }

      // Validate file
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
        if (uploadError.statusCode === '403' && uploadError.message.includes('row-level security policy')) {
          throw new Error("Upload failed: Storage permissions not configured. Please contact support.");
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ [imageType]: path })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      setProfile(prev => ({ ...prev, [imageType]: path }));

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      successMsg.textContent = 'Image uploaded successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorMsg.textContent = error.message;
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setUploadingImages(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleCoverSelect = async (filename) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("profiles")
      .update({ cover_image: filename })
      .eq("id", user.id);
    setProfile(prev => ({ ...prev, cover_image: filename }));
    setCoverModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    validateField('full_name', profile.full_name);
    validateField('vanity_username', profile.vanity_username);
    validateField('height', profile.height);
    validateField('instagram_handle', profile.instagram_handle);
    validateField('twitter_handle', profile.twitter_handle);
    validateField('snapchat_handle', profile.snapchat_handle);

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
        cover_image: profile.cover_image,
        headshot_image: profile.headshot_image,
        full_body_image_1: profile.full_body_image_1,
        full_body_image_2: profile.full_body_image_2,
        full_body_image_3: profile.full_body_image_3,
        full_body_image_4: profile.full_body_image_4,
        full_body_image_5: profile.full_body_image_5,
        type: profile.type,
        open_to_messages: profile.open_to_messages,
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
          {profile.cover_image ? (
            <img
              src={
                profile.cover_image.startsWith("default")
                  ? `/images/covers/${profile.cover_image}`
                  : `${bucketURL}/${profile.cover_image}`
              }
              alt="Cover"
              className="object-cover object-center w-full h-48 sm:h-64 rounded-lg"
            />
          ) : (
            <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-600">
              <div className="text-center">
                <i className="fas fa-image text-4xl mb-2"></i>
                <p>No Cover Image</p>
              </div>
            </div>
          )}

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
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  name="height" 
                  min="120" 
                  max="250" 
                  value={profile.height || ""} 
                  onChange={handleChange} 
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.height ? 'border-red-500' : 'border-gray-300'}`}
                />
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
              <label className="block text-sm font-medium mb-1">Instagram URL</label>
              <input 
                name="instagram_handle" 
                placeholder="https://instagram.com/username" 
                value={profile.instagram_handle || ""} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.instagram_handle ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.instagram_handle && <p className="text-red-500 text-sm mt-1">{errors.instagram_handle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Twitter URL</label>
              <input 
                name="twitter_handle" 
                placeholder="https://twitter.com/username" 
                value={profile.twitter_handle || ""} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.twitter_handle ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.twitter_handle && <p className="text-red-500 text-sm mt-1">{errors.twitter_handle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Snapchat URL</label>
              <input 
                name="snapchat_handle" 
                placeholder="https://snapchat.com/add/username" 
                value={profile.snapchat_handle || ""} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.snapchat_handle ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.snapchat_handle && <p className="text-red-500 text-sm mt-1">{errors.snapchat_handle}</p>}
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
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
                When your profile is public, producers and casting directors can discover you through search, 
                filter by your characteristics, and even bookmark you for future roles.
                Public profiles are more likely to receive invites to exclusive castings or custom content requests — sometimes without you even applying.
                <br /><br />
                In contrast, anonymous profiles are hidden from search results and only become visible after you apply for a gig.
                This means fewer eyes on your profile and more effort needed to find work.
              </p>
            </div>
          </div>
        </div>
        
        {/* NEW: Open to Messages Setting */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Privacy Settings
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.open_to_messages || false}
                onChange={(e) =>
                  setProfile({ ...profile, open_to_messages: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-800">Open to Messages</span>
                <p className="text-sm text-gray-600">
                  Allow anyone to send you messages (otherwise only people you've worked with or applied to can message you)
                </p>
              </div>
            </label>
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

          <button
            type="button"
            onClick={async () => {
              const confirm = window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.");
              if (!confirm) return;

              const { data: { user } } = await supabase.auth.getUser();
              await supabase.from("profiles").delete().eq("id", user.id);
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="w-full sm:w-auto bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Deactivate Account
          </button>
        </div>
      </form>

      {/* Cover Image Modal */}
      {coverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Choose a Cover Image</h2>
              <button 
                onClick={() => setCoverModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {DEFAULT_COVER_IMAGES.map((img) => (
                <div key={img} className="relative group">
                  <img
                    src={`/images/covers/${img}`}
                    alt={img}
                    className="rounded-lg shadow cursor-pointer hover:opacity-80 transition-opacity w-full h-32 object-cover"
                    onClick={() => handleCoverSelect(img)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <i className="fas fa-check text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Or upload your own:</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, "cover_image")} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}