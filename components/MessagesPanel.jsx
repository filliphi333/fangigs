
'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';

export default function MessagesPanel({ currentUserId, userProfile }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showConversations, setShowConversations] = useState(true);

  // Check if user can initiate conversations (only creators/producers)
  const canInitiateConversation = userProfile?.type === 'creator' || userProfile?.type === 'producer';
  
  // Debug logging
  useEffect(() => {
    console.log('MessagesPanel - userProfile:', userProfile);
    console.log('MessagesPanel - canInitiateConversation:', canInitiateConversation);
    console.log('MessagesPanel - userProfile.type:', userProfile?.type);
  }, [userProfile, canInitiateConversation]);
  
  // Check if user can participate in existing conversations (includes those they initiated)
  const canParticipateInConversation = (conversation) => {
    return canInitiateConversation || conversation?.initiator_id === currentUserId;
  };

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track user activity
  useEffect(() => {
    if (!currentUserId) return;

    const updateActivity = async () => {
      try {
        await fetch('/api/user-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId })
        });
      } catch (err) {
        console.error('Error updating activity:', err);
      }
    };

    // Update activity immediately
    updateActivity();

    // Update activity every 5 minutes while user is active
    const activityInterval = setInterval(updateActivity, 5 * 60 * 1000);

    // Update activity on user interaction
    const handleUserActivity = () => updateActivity();
    
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);

    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, [currentUserId]);

  // Fetch conversations with real-time updates
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      // Build query to get conversations for current user, excluding hidden ones
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:profiles!participant1(id, full_name, headshot_image, type, is_online, last_seen),
          participant_2:profiles!participant2(id, full_name, headshot_image, type, is_online, last_seen),
          job_postings!job_id(id, title),
          messages(content, created_at, sender_id, read, file_type)
        `)
        .or(`participant1.eq.${currentUserId},participant2.eq.${currentUserId}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Filter out hidden conversations on client side to avoid RLS issues
      const filteredData = data?.filter(conv => {
        const isParticipant1 = conv.participant1 === currentUserId;
        const hiddenField = isParticipant1 ? 'p1_hidden' : 'p2_hidden';
        return !conv[hiddenField];
      });

      setConversations(filteredData || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Real-time subscription for conversations
  useEffect(() => {
    if (!currentUserId) return;

    fetchConversations();

    let conversationSubscription;
    let messageSubscription;

    const setupSubscriptions = async () => {
      try {
        conversationSubscription = supabase
          .channel(`conversations_${currentUserId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `or(participant1.eq.${currentUserId},participant2.eq.${currentUserId})`
          }, (payload) => {
            fetchConversations();
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Conversation subscription active');
            } else if (status === 'CHANNEL_ERROR') {
              console.warn('Conversation subscription error, retrying...');
              setTimeout(setupSubscriptions, 5000);
            }
          });

        messageSubscription = supabase
          .channel(`messages_panel_${currentUserId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, (payload) => {
            // Only refresh if the message is for this user's conversations
            const relevantConversation = conversations.find(conv => conv.id === payload.new.conversation_id);
            if (relevantConversation) {
              fetchConversations();
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Message subscription active');
            } else if (status === 'CHANNEL_ERROR') {
              console.warn('Message subscription error, retrying...');
              setTimeout(setupSubscriptions, 5000);
            }
          });
      } catch (err) {
        console.error('Error setting up subscriptions:', err);
        // Retry after 5 seconds
        setTimeout(setupSubscriptions, 5000);
      }
    };

    setupSubscriptions();

    return () => {
      if (conversationSubscription) {
        supabase.removeChannel(conversationSubscription);
      }
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
    };
  }, [currentUserId, fetchConversations]);

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    const partner = conv.participant1 === currentUserId ? conv.participant_2 : conv.participant_1;
    return partner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) setShowConversations(false);
  };

  // Handle back to conversations (mobile)
  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversations(true);
  };

  // Start new conversation (only for creators/producers)
  const startNewConversation = async (recipientId, jobId = null) => {
    if (!canInitiateConversation) {
      setError('Only creators and producers can initiate conversations');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1: currentUserId,
          participant2: recipientId,
          job_id: jobId,
          initiator_id: currentUserId,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      fetchConversations();
      setSelectedConversation(data);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message);
    }
  };

  // Delete conversation (soft delete - hide for current user only)
  const deleteConversation = async (conversationId) => {
    try {
      // Find the conversation to determine which participant is the current user
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Determine which hidden flag to update based on current user
      const isParticipant1 = conversation.participant1 === currentUserId;
      const updateField = isParticipant1 ? 'p1_hidden' : 'p2_hidden';

      // Soft delete by hiding conversation for current user - use single condition for RLS
      const { error } = await supabase
        .from('conversations')
        .update({ [updateField]: true })
        .eq('id', conversationId)
        .eq(isParticipant1 ? 'participant1' : 'participant2', currentUserId);

      if (error) throw error;

      // Clear selected conversation if it was the deleted one
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }

      // Refresh conversations list
      fetchConversations();
    } catch (err) {
      console.error('Error hiding conversation:', err);
      setError('Failed to hide conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Messages</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-comments text-2xl"></i>
            <div>
              <h2 className="text-xl font-bold">Messages</h2>
              <p className="text-blue-100 text-sm">
                {filteredConversations.length} conversations
              </p>
            </div>
          </div>
          {!canInitiateConversation && (
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
              <i className="fas fa-info-circle mr-1"></i>
              View Only
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pl-10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20"
          />
          <i className="fas fa-search absolute left-3 top-3 text-white/70"></i>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-96 md:h-[500px]">
        {/* Conversations List */}
        <div className={`${
          isMobile 
            ? (showConversations ? 'w-full' : 'hidden') 
            : 'w-1/3 border-r border-gray-200'
        } overflow-y-auto`}>
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              {canInitiateConversation ? (
                <p className="text-sm">Start browsing talent to begin conversations</p>
              ) : (
                <p className="text-sm">Creators will reach out to you about opportunities</p>
              )}
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              currentUserId={currentUserId}
              onSelect={handleConversationSelect}
              selectedId={selectedConversation?.id}
              enableDirectNavigation={false}
              onDeleteConversation={deleteConversation}
            />
          )}
        </div>

        {/* Message Thread */}
        <div className={`${
          isMobile 
            ? (showConversations ? 'hidden' : 'w-full') 
            : 'flex-1'
        } flex flex-col`}>
          {selectedConversation ? (
            <>
              {/* Mobile back button */}
              {isMobile && (
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <button
                    onClick={handleBackToConversations}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Conversations
                  </button>
                </div>
              )}
              <MessageThread
                conversation={selectedConversation}
                currentUserId={currentUserId}
                userProfile={userProfile}
                onBack={isMobile ? handleBackToConversations : null}
                onDeleteConversation={deleteConversation}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              <div className="text-center max-w-md">
                <i className="fas fa-comment-dots text-6xl text-gray-300 mb-6"></i>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Access Control Notice */}
      {!canInitiateConversation && (
        <div className="bg-blue-50 border-t border-blue-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <i className="fas fa-shield-alt"></i>
            <span className="text-sm font-medium">
              Only creators and producers can initiate conversations for safety and spam prevention
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
