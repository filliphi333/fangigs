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
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
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
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    const extension = file.name.split(".").pop();
    const path = `${user.id}/${imageType}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
    if (!uploadError) {
      await supabase
        .from("profiles")
        .update({ [imageType]: path })
        .eq("id", user.id);
      setProfile(prev => ({ ...prev, [imageType]: path }));
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
    setUpdating(true);
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
      camera_experience: profile.camera_experience,
      instagram_handle: profile.instagram_handle,
      twitter_handle: profile.twitter_handle,
      snapchat_handle: profile.snapchat_handle,
      is_public: profile.is_public,
      cover_image: profile.cover_image,
      headshot_image: profile.headshot_image,
      full_body_image_1: profile.full_body_image_1,
      full_body_image_2: profile.full_body_image_2,
    };
    const { error } = await supabase
  .from("profiles")
  .upsert([{ id: user.id, ...updates }], { onConflict: "id" });
    if (!error) {
      alert("Profile updated!");
      router.push("/profile/" + updates.vanity_username);
    }
    setUpdating(false);
  };

  const bucketURL = "https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars";

  if (loading) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
      >
        <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

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
      className="object-cover object-center w-full h-48 sm:h-64 rounded"
    />
  ) : (
    <div className="w-full h-48 sm:h-64 bg-gray-300 rounded flex items-center justify-center text-gray-600">
      No Cover Image
    </div>
  )}

  {/* Avatar */}
  {profile.headshot_image && (
    <img
      src={`${bucketURL}/${profile.headshot_image}`}
      alt="Avatar"
      className="absolute w-72 h-72 rounded-full object-cover border-4 border-white left-6 -bottom-16 shadow-md z-10"
    />
  )}

  <button
    type="button"
    className="absolute top-2 right-2 bg-white px-3 py-1 text-sm border rounded shadow"
    onClick={() => setCoverModalOpen(true)}
  >
    Change Cover
  </button>
</div>

        <input name="full_name" placeholder="Full Name" value={profile.full_name || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <p className="text-xs text-gray-500 mb-3">Your real or stage name</p>

        <input name="vanity_username" placeholder="Username" value={profile.vanity_username || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <p className="text-xs text-gray-500 mb-3">Appears in your URL</p>

        <textarea name="bio" placeholder="Tell us about yourself..." value={profile.bio || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <p className="text-xs text-gray-500 mb-3">Share experience, interests</p>

        <label className="block text-sm font-medium mb-1">Height (cm)</label>
        <input type="number" name="height" min="120" max="250" value={profile.height || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <p className="text-xs text-gray-500 mb-3">Used for casting filters</p>

        <input name="birthday" type="date" value={profile.birthday || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <input name="gender" placeholder="Gender" value={profile.gender || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <input name="hair_color" placeholder="Hair Color" value={profile.hair_color || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <input name="sexual_orientation" placeholder="Sexual Orientation" value={profile.sexual_orientation || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />

        <select name="camera_experience" value={profile.camera_experience || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1">
          <option value="">Camera Experience</option>
          <option>No Experience</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Pro</option>
        </select>

        <h2 className="text-lg font-semibold mt-8 mb-2">Photos</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Head-shot (Avatar)</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "headshot_image")} />
          {profile.headshot_image && <img src={`${bucketURL}/${profile.headshot_image}`} alt="Avatar" className="mt-2 w-24 h-24 object-cover rounded-full" />}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full-body Photo 1</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "full_body_image_1")} />
          {profile.full_body_image_1 && <img src={`${bucketURL}/${profile.full_body_image_1}`} alt="Body 1" className="mt-2 w-32 h-48 object-cover rounded" />}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Full-body Photo 2</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "full_body_image_2")} />
          {profile.full_body_image_2 && <img src={`${bucketURL}/${profile.full_body_image_2}`} alt="Body 2" className="mt-2 w-32 h-48 object-cover rounded" />}
        </div>

        <input name="instagram_handle" placeholder="Instagram URL" value={profile.instagram_handle || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <input name="twitter_handle" placeholder="Twitter URL" value={profile.twitter_handle || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />
        <input name="snapchat_handle" placeholder="Snapchat URL" value={profile.snapchat_handle || ""} onChange={handleChange} className="w-full p-2 border rounded mb-1" />

        <div className="flex items-start mb-6 mt-4">
          <input type="checkbox" checked={!profile.is_public} onChange={(e) => setProfile(prev => ({ ...prev, is_public: !e.target.checked }))} className="mt-1 mr-2" />
          <div>
            <label className="font-medium">Make Profile Anonymous</label>
            <p className="text-xs text-gray-500">
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

       <div className="flex justify-end mt-6 gap-4">
  <button
    type="submit"
    className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700"
    disabled={updating}
  >
    {updating ? "Saving..." : "Save Profile"}
  </button>

  <button
    type="button"
    onClick={() => router.push("/change-password")}
    className="bg-yellow-500 text-white font-semibold px-6 py-2 rounded hover:bg-yellow-600"
  >
    Change Password
  </button>

  <button
    type="button"
    onClick={async () => {
      const confirm = window.confirm("Are you sure you want to deactivate your account?");
      if (!confirm) return;

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      router.push("/");
    }}
    className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700"
  >
    Deactivate Account
  </button>
</div>
</form>

      {coverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Choose a Cover Image</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
              {DEFAULT_COVER_IMAGES.map((img) => (
                <img
                  key={img}
                  src={`/images/covers/${img}`}
                  alt={img}
                  className="rounded shadow cursor-pointer hover:opacity-80"
                  onClick={() => handleCoverSelect(img)}
                />
              ))}
            </div>
            <p className="mt-4 text-sm">Or upload your own:</p>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover_image")} />
            <button type="button" className="mt-4 text-sm text-blue-600 underline" onClick={() => setCoverModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
