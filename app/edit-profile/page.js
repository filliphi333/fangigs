"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/"; // redirect to home or sign-in page
};

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [updating, setUpdating] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No user signed in:", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
      } else {
        setProfile({
          ...data,
          email: user.email, // Inject email from auth
        });
      }

      setLoading(false); // Always stop loading
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("User not signed in:", authError);
      alert("You must be signed in to update your profile.");
      setUpdating(false);
      return;
    }

    const updateData = {
      full_name: profile.full_name,
      vanity_username: profile.vanity_username,
      bio: profile.bio,
      birthday: profile.birthday,
      height: profile.height,
      gender: profile.gender,
      hair_color: profile.hair_color,
      sexual_orientation: profile.sexual_orientation,
      camera_experience: profile.camera_experience,
      twitter_handle: profile.twitter_handle,
      instagram_handle: profile.instagram_handle,
      snapchat_handle: profile.snapchat_handle,
      is_public: profile.is_public,
      full_body_image_1: profile.full_body_image_1,
      full_body_image_2: profile.full_body_image_2,
      headshot_image: profile.headshot_image, // Ensure headshot_image is part of the data
    };

    console.log("Updating profile for user ID:", user.id);
    console.log("With data:", updateData);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        alert("Error updating profile");
        console.error("Supabase Error:", error);
      } else {
        alert("Profile updated!");
        if (profile.type === "creator") {
          router.push("/producer-dashboard");
        } else {
          router.push("/talent-dashboard");
        }
      }
    } catch (err) {
      console.error("Error during profile update:", err);
      alert("There was an issue updating your profile.");
    }

    setUpdating(false);
  };

  const handleImageUpload = async (event, imageType) => {
    const file = event.target.files[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to upload.");
      return;
    }

    const extension = file.name.split(".").pop();
    const filePath = `${user.id}/${imageType}.${extension}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        alert("Upload failed.");
      } else {
        const imageUrl = filePath; // Use the file path as the image URL
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ [imageType]: imageUrl }) // Update the appropriate field
          .eq("id", user.id);

        if (updateError) {
          console.error("Failed to update profile with image URL:", updateError.message);
        } else {
          setProfile((prev) => ({ ...prev, [imageType]: imageUrl })); // Update profile state
        }
      }
    } catch (err) {
      console.error("Error during file upload:", err);
      alert("There was an issue uploading the file.");
    }
  };

  if (loading) return <p>Loading...</p>;

  const bucketURL = "https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars";

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#B5E2FF" }}>
      <div className="bg-white w-full max-w-6xl p-6 rounded-lg flex space-x-6">
        {/* Left Section */}
        <div className="w-1/4 flex flex-col items-center">
          {profile.headshot_image ? (
            <img
              src={`${bucketURL}/${profile.headshot_image}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4" />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "headshot_image")}
            className="w-full p-1 border rounded mb-4"
          />

          <p className="font-semibold">{profile.full_name || "Full Name"}</p>
          <p className="text-gray-500 text-sm">{profile.email || "user@email.com"}</p>

          <div className="w-full mt-8 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Full Body Picture 1</label>
            {profile.full_body_image_1 && (
              <img src={`${bucketURL}/${profile.full_body_image_1}`} className="w-full mb-2 rounded" alt="Full Body 1" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "full_body_image_1")}
              className="w-full p-1 border rounded"
            />

            <label className="block text-sm font-medium text-gray-700">Full Body Picture 2</label>
            {profile.full_body_image_2 && (
              <img src={`${bucketURL}/${profile.full_body_image_2}`} className="w-full mb-2 rounded" alt="Full Body 2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "full_body_image_2")}
              className="w-full p-1 border rounded"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Middle Section */}
        <div className="w-2/4 space-y-4">
          <h1 className="text-xl font-bold mb-4">Edit Your Profile</h1>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              name="vanity_username"
              value={profile.vanity_username || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., sashasmith"
            />
            {usernameError && <p className="text-sm text-red-500 mt-1">{usernameError}</p>}
          </div>

          <input name="full_name" placeholder="Full Name" value={profile.full_name || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          <textarea name="bio" placeholder="Short bio..." value={profile.bio || ""} onChange={handleChange} className="w-full p-2 border rounded" />

          <div className="flex items-center space-x-2">
            <input type="date" name="birthday" value={profile.birthday || ""} onChange={handleChange} className="p-2 border rounded" />
            <span className="text-sm text-gray-600">Birthday</span>
          </div>

          <input name="height" placeholder="Height" value={profile.height || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="gender" placeholder="Gender (optional)" value={profile.gender || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="hair_color" placeholder="Hair Color" value={profile.hair_color || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="sexual_orientation" placeholder="Sexual Orientation" value={profile.sexual_orientation || ""} onChange={handleChange} className="w-full p-2 border rounded" />

          <label className="flex items-center">
            <input type="checkbox" name="camera_experience" checked={profile.camera_experience || false} onChange={handleChange} className="mr-2" />
            Experienced on Camera
          </label>

          <div className="flex space-x-4 mt-4">
            <button type="submit" onClick={handleSubmit} disabled={updating} className="bg-[#E8967B] text-white px-4 py-2 rounded hover:opacity-90">
              {updating ? "Saving..." : "Save Profile"}
            </button>
            <button className="bg-[#04BADE] text-white px-4 py-2 rounded hover:bg-blue-700">Change Password</button>
            <button className="bg-[#ff2c2c] text-white px-4 py-2 rounded hover:bg-[#c30010]">Deactivate Account</button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Right Section */}
        <div className="w-1/4 space-y-4">
          <input name="twitter_handle" placeholder="@Twitter" value={profile.twitter || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="instagram_handle" placeholder="@Instagram" value={profile.instagram || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="snapchat_handle" placeholder="@Snapchat" value={profile.snapchat || ""} onChange={handleChange} className="w-full p-2 border rounded" />

          <label className="flex items-center mt-4">
            <input type="checkbox" name="is_public" checked={profile.is_public || false} onChange={handleChange} className="mr-2" />
            Make Profile Public
          </label>
        </div>
      </div>
    </main>
  );
}
