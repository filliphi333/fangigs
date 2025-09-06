
"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function DeactivateAccount({ className = "" }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeactivate = async () => {
    const confirmMessage = `⚠️ ACCOUNT DEACTIVATION WARNING ⚠️

This will permanently delete:
• Your profile and all personal information
• All job applications and job postings
• All messages and conversations
• All saved profiles and bookmarks
• All uploaded photos and files

This action CANNOT be undone and you will lose access immediately.

Type "DELETE MY ACCOUNT" below to confirm:`;

    const userConfirmation = prompt(confirmMessage);
    if (userConfirmation !== "DELETE MY ACCOUNT") {
      if (userConfirmation !== null) {
        alert("Account deletion cancelled. You must type exactly 'DELETE MY ACCOUNT' to proceed.");
      }
      return;
    }

    const finalConfirm = window.confirm("FINAL CONFIRMATION: Are you absolutely sure you want to permanently delete your account? This cannot be undone.");
    if (!finalConfirm) return;

    try {
      setIsDeleting(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Please log in to deactivate your account");
      }

      // Step 1: Delete from conversations (hide for user)
      await supabase
        .from('conversations')
        .update({ 
          p1_hidden: true,
          p2_hidden: true 
        })
        .or(`participant1.eq.${user.id},participant2.eq.${user.id}`);

      // Step 2: Delete applications
      await supabase
        .from('applications')
        .delete()
        .eq('applicant_id', user.id);

      // Step 3: Delete job postings
      await supabase
        .from('jobs')
        .delete()
        .eq('producer_id', user.id);

      // Step 4: Delete saved profiles
      await supabase
        .from('saved_profiles')
        .delete()
        .or(`producer_id.eq.${user.id},saved_profile_id.eq.${user.id}`);

      // Step 5: Delete messages
      await supabase
        .from('messages')
        .delete()
        .eq('user_id', user.id);

      // Step 6: Delete storage files (photos)
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filePaths);
      }

      // Step 7: Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        throw new Error(`Failed to delete profile: ${profileError.message}`);
      }

      // Step 8: Sign out and redirect
      await supabase.auth.signOut();
      
      // Show success message
      alert("Account successfully deleted. You will now be redirected to the homepage.");
      router.push("/");

    } catch (error) {
      console.error('Error deleting account:', error);
      alert(`Error deleting account: ${error.message}. Please contact support if this issue persists.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDeactivate}
      className={`w-full sm:w-auto bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting Account..." : "Deactivate Account"}
    </button>
  );
}
