'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import MessageThread from '../../../components/MessageThread';

export default function ConversationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.push('/');
          return;
        }

        setUser(user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Validate conversation ID format
        if (!id || typeof id !== 'string') {
          setError('Invalid conversation ID');
          return;
        }

        // Fetch specific conversation
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select(`
            *,
            participant_1:profiles!participant1(id, full_name, headshot_image, type, is_online, last_seen),
            participant_2:profiles!participant2(id, full_name, headshot_image, type, is_online, last_seen),
            job_postings!job_id(id, title)
          `)
          .eq('id', id)
          .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
          .eq('status', 'active')
          .single();

        if (conversationError) {
          if (conversationError.code === 'PGRST116') {
            setError('Conversation not found or you do not have access to it');
          } else {
            console.error('Database error:', conversationError);
            setError('Failed to load conversation. Please try again.');
          }
          return;
        }

        if (!conversationData) {
          setError('Conversation not found');
          return;
        }

        setConversation(conversationData);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleBackToInbox = () => {
    router.push('/messages');
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      // Determine which hidden flag to update based on current user
      const isParticipant1 = conversation.participant1 === user.id;
      const updateField = isParticipant1 ? 'p1_hidden' : 'p2_hidden';

      // Soft delete by hiding conversation for current user - use single condition for RLS
      const { error } = await supabase
        .from('conversations')
        .update({ [updateField]: true })
        .eq('id', conversationId)
        .eq(isParticipant1 ? 'participant1' : 'participant2', user.id);

      if (error) throw error;

      // Navigate back to messages after hiding
      router.push('/messages');
    } catch (err) {
      console.error('Error hiding conversation:', err);
      setError('Failed to hide conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !profile || !conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversation Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The conversation you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/messages')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Messages
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl h-screen flex flex-col">
          {/* Header with back button */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-4">
            <button
              onClick={handleBackToInbox}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              aria-label="Back to messages"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div className="flex items-center gap-3">
              <i className="fas fa-comment text-xl"></i>
              <h1 className="text-xl font-bold">Conversation</h1>
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-hidden">
            <MessageThread
              conversation={conversation}
              currentUserId={user.id}
              userProfile={profile}
              onBack={handleBackToInbox}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}