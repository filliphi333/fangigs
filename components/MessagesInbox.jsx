
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MessagesPanel from './MessagesPanel';

export default function MessagesInbox({ currentUserId, userProfile }) {
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch message stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get conversation count
        const { count: conversationsCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .or(`participant1.eq.${currentUserId},participant2.eq.${currentUserId}`)
          .eq('status', 'active');

        // Get unread message count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', currentUserId)
          .eq('read', false);

        setStats({
          totalConversations: conversationsCount || 0,
          unreadMessages: unreadCount || 0
        });
      } catch (err) {
        console.error('Error fetching message stats:', err);
        setError('Failed to load message statistics');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchStats();

      // Set up real-time subscription for stats updates
      const channel = supabase.channel('message_stats')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId}`
        }, () => {
          fetchStats();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `or(participant1.eq.${currentUserId},participant2.eq.${currentUserId})`
        }, () => {
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Messages</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          <i className="fas fa-inbox mr-3 text-blue-600"></i>
          Your Messages
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your conversations with talented creators and potential collaborators
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
            <div className="text-sm text-gray-600">Total Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.unreadMessages}</div>
            <div className="text-sm text-gray-600">Unread Messages</div>
          </div>
        </div>
      </div>

      {/* Messages Panel */}
      <div className="max-w-5xl mx-auto">
        <MessagesPanel 
          currentUserId={currentUserId} 
          userProfile={userProfile} 
        />
      </div>

      {/* Help Section */}
      <div className="max-w-3xl mx-auto bg-blue-50 rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          <i className="fas fa-lightbulb mr-2"></i>
          Tips for Messaging
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <i className="fas fa-shield-alt mr-2"></i>
            Only creators and producers can initiate conversations
          </div>
          <div>
            <i className="fas fa-handshake mr-2"></i>
            Be professional and respectful in all communications
          </div>
          <div>
            <i className="fas fa-clock mr-2"></i>
            Response times may vary based on user availability
          </div>
          <div>
            <i className="fas fa-file-image mr-2"></i>
            You can share images and files in conversations
          </div>
        </div>
      </div>
    </div>
  );
}
