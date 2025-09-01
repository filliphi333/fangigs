'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ConversationList({ conversations, currentUserId, onSelect, selectedId, enableDirectNavigation = false, onDeleteConversation }) {
  const [participants, setParticipants] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());
  const router = useRouter();

  // Fetch participant details
  const fetchParticipants = useCallback(async () => {
    const ids = conversations
      .map(conv => conv.participant1 === currentUserId ? conv.participant2 : conv.participant1)
      .filter((id, index, self) => self.indexOf(id) === index);

    if (ids.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, headshot_image, type, is_online, last_seen, vanity_username')
        .in('id', ids);

      if (!error && data) {
        const map = {};
        data.forEach(p => {
          map[p.id] = p;
        });
        setParticipants(map);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  }, [conversations, currentUserId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Real-time online status updates
  useEffect(() => {
    if (Object.keys(participants).length === 0) return;

    const subscription = supabase
      .channel('online_status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id.in.(${Object.keys(participants).join(',')})`
      }, (payload) => {
        setParticipants(prev => ({
          ...prev,
          [payload.new.id]: { ...prev[payload.new.id], ...payload.new }
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [participants]);

  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return lastSeenDate.toLocaleDateString();
  };

  // Get last message preview
  const getLastMessagePreview = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1] || messages[0];

    if (lastMessage.message_type === 'image') return '📷 Photo';
    if (lastMessage.message_type === 'file') return '📎 File';

    return lastMessage.content?.length > 40
      ? `${lastMessage.content.substring(0, 40)}...`
      : lastMessage.content || '';
  };

  // Check if conversation has unread messages
  const hasUnreadMessages = (conversation) => {
    if (!conversation.messages) return false;
    return conversation.messages.some(msg =>
      msg.sender_id !== currentUserId && !msg.read
    );
  };

  // Delete conversation - use parent's handler if available
  const handleDeleteConversation = async (conversationId) => {
    if (onDeleteConversation) {
      // Use the parent's delete handler which handles both DB deletion and UI updates
      await onDeleteConversation(conversationId);
    } else {
      // Fallback to local deletion if no parent handler is provided
      try {
        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);

        if (error) {
          console.error('Error deleting conversation:', error);
        } else {
          console.log('Conversation deleted successfully');
        }
      } catch (err) {
        console.error('Error deleting conversation:', err);
      }
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map(conv => {
        const partnerId = conv.participant1 === currentUserId ? conv.participant2 : conv.participant1;
        const partner = participants[partnerId];
        const isSelected = selectedId === conv.id;
        const unread = hasUnreadMessages(conv);
        const isOnline = partner?.is_online;
        const isTyping = typingUsers.has(partnerId);

        const handleConversationClick = () => {
          if (enableDirectNavigation) {
            router.push(`/messages/${conv.id}`);
          } else {
            onSelect(conv);
          }
        };

        return (
          <div
            key={conv.id}
            onClick={handleConversationClick}
            className={`group cursor-pointer p-4 transition-all duration-200 hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar with online status */}
              <div className="relative flex-shrink-0">
                <Image
                  src={partner?.headshot_image
                    ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${partner.headshot_image}?t=${Date.now()}`
                    : '/placeholder-avatar.png'
                  }
                  alt={partner?.full_name || 'User'}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = '/placeholder-avatar.png';
                  }}
                />
                {/* Online status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>

              {/* Conversation details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${unread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {partner?.full_name || 'Unknown User'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(conv.last_message_at || conv.updated_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* User type badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    partner?.type === 'creator'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {partner?.type === 'creator' ? 'Creator/Producer' : partner?.type || 'User'}
                  </span>
                  {!isOnline && partner?.last_seen && (
                    <span className="text-xs text-gray-400">
                      {formatLastSeen(partner.last_seen)}
                    </span>
                  )}
                </div>

                {/* Last message or typing indicator */}
                <div className="flex items-center">
                  {isTyping ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-xs italic">typing...</span>
                    </div>
                  ) : (
                    <p className={`text-sm truncate ${unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {getLastMessagePreview(conv.messages)}
                    </p>
                  )}
                </div>

                {/* Job context */}
                {conv.job_postings && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <i className="fas fa-briefcase"></i>
                    <span className="truncate">Re: {conv.job_postings.title}</span>
                  </div>
                )}
              </div>

              {/* Delete conversation button */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hide conversation with ${partner?.full_name}? You can still be messaged by this user.`)) {
                      handleDeleteConversation(conv.id);
                    }
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete conversation"
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}