"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const type = searchParams.get('type');

      // Handle password recovery
      if (type === 'recovery') {
        setIsPasswordReset(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Recovery error:", error);
          router.push("/forgot-password?error=recovery_failed");
          return;
        }

        if (data.session) {
          // Redirect to change password page
          router.push("/change-password?recovery=true");
          return;
        }
      }

      // Handle regular auth callback
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        router.push("/?error=auth_failed");
        return;
      }

      if (data.session) {
        // User is authenticated, redirect to dashboard
        const { data: profile } = await supabase
          .from("profiles")
          .select("type")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.type === "creator") {
          router.push("/producer-dashboard");
        } else {
          router.push("/talent-dashboard");
        }
      } else {
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className={`fas ${isPasswordReset ? 'fa-key' : 'fa-user-check'} text-2xl text-purple-600`}></i>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">
          {isPasswordReset ? "Setting up password reset..." : "Authenticating..."}
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-user-check text-2xl text-purple-600"></i>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}