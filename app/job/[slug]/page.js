
'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function JobPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sessionUser, setSessionUser] = useState(null);
  const [userType, setUserType] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Auth
        const { data: { user }} = await supabase.auth.getUser();
        setSessionUser(user || null);

        // 2️⃣ Job by slug
        const { data: jobData, error: jobErr } = await supabase
          .from("job_postings")
          .select("*")
          .eq("slug", slug)
          .single();

        if (jobErr) throw new Error("Job not found");
        if (!jobData) throw new Error("Job not found");

        setJob(jobData);

        // 3️⃣ Producer profile
        if (jobData.creator_id) {
          const { data: producerData, error: producerErr } = await supabase
            .from("profiles")
            .select("vanity_username, full_name, headshot_image")
            .eq("id", jobData.creator_id)
            .single();
          
          if (!producerErr && producerData) {
            setProducer(producerData);
          }
        }

        // 4️⃣ Current user's type & existing application
        if (user) {
          const { data: myProf } = await supabase
            .from("profiles")
            .select("type")
            .eq("id", user.id)
            .single();

          if (myProf?.type) setUserType(myProf.type);

          const { data: appRow } = await supabase
            .from("job_applications")
            .select("id")
            .eq("job_id", jobData.id)
            .eq("talent_id", user.id)
            .maybeSingle();

          if (appRow) setAlreadyApplied(true);
        }
      } catch (err) {
        console.error("Error fetching job data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleApply = async () => {
    if (!sessionUser) {
      alert("You must be logged in to apply.");
      router.push("/sign-in");
      return;
    }
    if (alreadyApplied) {
      alert("You have already applied to this gig.");
      return;
    }

    try {
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id,
        talent_id: sessionUser.id
      });

      if (error) throw error;

      setAlreadyApplied(true);
      alert("Application sent successfully!");
    } catch (error) {
      console.error("Error applying:", error);
      alert("Error sending application. Please try again.");
    }
  };

  const handleAskQuestion = async () => {
    if (!sessionUser) {
      alert("You must be logged in to ask questions.");
      router.push("/sign-in");
      return;
    }

    try {
      // Check if job conversation already exists
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1.eq.${sessionUser.id},participant2.eq.${job.creator_id}),and(participant1.eq.${job.creator_id},participant2.eq.${sessionUser.id})`)
        .eq('job_id', job.id)
        .maybeSingle();

      if (convError) {
        throw convError;
      }

      let conversationId;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new job conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant1: sessionUser.id,
            participant2: job.creator_id,
            job_id: job.id,
            initiator_id: sessionUser.id,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;

        // Send initial question message
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: sessionUser.id,
          recipient_id: job.creator_id,
          content: `Question about "${job.title}"...`,
          message_type: 'text',
          status: 'sent'
        });
      }

      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Error starting conversation. Please try again.');
    }
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'flexible':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJobTypeStyle = (jobType) => {
    switch (jobType) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'collab':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'one-time':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The job you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/find-work">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
              <i className="fas fa-arrow-left mr-2"></i>
              Browse Jobs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Producer Info */}
            <div className="flex items-center gap-4">
              {producer?.headshot_image ? (
                <img
                  src={`https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${producer.headshot_image}`}
                  alt={producer.full_name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {producer?.full_name?.charAt(0) || job.title?.charAt(0) || 'J'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {producer?.full_name || 'Anonymous Producer'}
                </h2>
                {producer?.vanity_username && (
                  <Link 
                    href={`/profile/${producer.vanity_username}`} 
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    @{producer.vanity_username}
                  </Link>
                )}
              </div>
            </div>

            {/* Job Status Badges */}
            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyStyle(job.urgency)}`}>
                {job.urgency === 'urgent' && <i className="fas fa-exclamation-triangle mr-1"></i>}
                {job.urgency === 'normal' && <i className="fas fa-clock mr-1"></i>}
                {job.urgency === 'flexible' && <i className="fas fa-leaf mr-1"></i>}
                {job.urgency || 'Normal'} Priority
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getJobTypeStyle(job.job_type)}`}>
                {job.job_type === 'ongoing' && <i className="fas fa-sync-alt mr-1"></i>}
                {job.job_type === 'collab' && <i className="fas fa-handshake mr-1"></i>}
                {job.job_type === 'one-time' && <i className="fas fa-calendar-check mr-1"></i>}
                {job.job_type === 'ongoing' ? 'Ongoing' : job.job_type === 'collab' ? 'Collaboration' : 'One-time'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                job.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                <i className={`fas ${job.is_active ? 'fa-check-circle' : 'fa-pause-circle'} mr-1`}></i>
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Job Title */}
          <h1 className="text-4xl font-bold text-gray-900 mt-6 mb-4">{job.title}</h1>

          {/* Job Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <i className="fas fa-map-marker-alt text-red-500"></i>
              <span className="font-medium">{job.location || "Remote"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <i className="fas fa-dollar-sign text-green-500"></i>
              <span className="font-medium">
                {job.is_pay_confidential ? "Confidential" : job.pay ? `$${job.pay}` : "Negotiable"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <i className="fas fa-calendar text-blue-500"></i>
              <span className="font-medium">
                {job.expiration ? `Expires ${new Date(job.expiration).toLocaleDateString()}` : "No expiration"}
              </span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-file-alt text-blue-600"></i>
            Project Description
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-tags text-purple-600"></i>
              Tags
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.tags.map((tag, i) => (
                <span key={i} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {userType === "talent" && (
              <>
                {alreadyApplied ? (
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold">
                    <i className="fas fa-check-circle"></i>
                    Application Submitted
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Apply to This Gig
                  </button>
                )}
                
                <button
                  onClick={handleAskQuestion}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                >
                  <i className="fas fa-question-circle mr-2"></i>
                  Ask a Question
                </button>
              </>
            )}

            {!sessionUser && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">You must be logged in to apply or ask questions.</p>
                <Link href="/sign-in">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                    Sign In to Apply
                  </button>
                </Link>
              </div>
            )}

            {userType === "creator" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  <i className="fas fa-info-circle mr-2"></i>
                  You're viewing this as a creator. Only talent can apply to gigs.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
