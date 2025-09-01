'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

export default function MessageThread({ conversation, currentUserId, userProfile, onBack, onDeleteConversation }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get conversation partner
  const partnerId = conversation.participant1 === currentUserId 
    ? conversation.participant2
    : conversation.participant1;

  // Fetch partner details
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (!error && data) {
          setPartner(data);
        }
      } catch (err) {
        console.error('Error fetching partner:', err);
      }
    };

    if (partnerId) fetchPartner();
  }, [partnerId]);

  // Fetch messages with real-time updates
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        // Mark messages as read
        await markMessagesAsRead();
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversation.id)
        .eq('recipient_id', currentUserId)
        .eq('read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Real-time message subscription
  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`messages_${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        if (payload.new.sender_id !== currentUserId) {
          markMessagesAsRead();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id ? payload.new : msg
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversation.id, currentUserId, fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // In a real app, you'd broadcast typing status
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Broadcast stop typing
    }, 1000);
  };

  // Check if user can send messages:
  // 1. Creators/producers can always send messages
  // 2. If user initiated the conversation, they can send messages
  // 3. If user didn't initiate but the conversation exists, they can reply (since only creators/producers can initiate)
  const canSendMessage = userProfile?.type === 'creator' || 
                        userProfile?.type === 'producer' || 
                        conversation.initiator_id === currentUserId ||
                        (conversation.initiator_id !== currentUserId && conversation.id);

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;
    
    // Debug logging
    console.log('MessageThread - userProfile:', userProfile);
    console.log('MessageThread - userProfile.type:', userProfile?.type);
    console.log('MessageThread - conversation.initiator_id:', conversation.initiator_id);
    console.log('MessageThread - currentUserId:', currentUserId);
    console.log('MessageThread - canSendMessage:', canSendMessage);
    
    if (!canSendMessage) {
      alert('You can only reply to conversations initiated by creators or producers');
      return;
    }

    try {
      setSending(true);
      let fileUrl = null;

      // Handle file upload
      if (selectedFile) {
        setUploadingFile(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('message-files')
            .upload(fileName, selectedFile);

          if (uploadError) {
            // If bucket doesn't exist, create it or use avatars bucket as fallback
            console.warn('message-files bucket not found, using avatars bucket');
            const { data: fallbackData, error: fallbackError } = await supabase.storage
              .from('avatars')
              .upload(`messages/${fileName}`, selectedFile);

            if (fallbackError) throw fallbackError;

            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(`messages/${fileName}`);

            fileUrl = publicUrl;
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('message-files')
              .getPublicUrl(fileName);

            fileUrl = publicUrl;
          }
          setUploadingFile(false);
        } catch (fileError) {
          console.error('File upload failed:', fileError);
          setUploadingFile(false);
          alert('Failed to upload file. Please try again.');
          return;
        }
      }

      const messageData = {
        conversation_id: conversation.id,
        sender_id: currentUserId,
        recipient_id: partnerId,
        content: newMessage.trim() || `Shared ${selectedFile?.type?.startsWith('image/') ? 'an image' : 'a file'}`,
        message_type: selectedFile?.type?.startsWith('image/') ? 'image' : selectedFile ? 'file' : 'text',
        file_url: fileUrl,
        status: 'sent'
      };

      const { error } = await supabase.from('messages').insert(messageData);
      if (error) throw error;

      // Update conversation last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle delete conversation (soft delete)
  const handleDeleteConversation = async () => {
    if (onDeleteConversation) {
      await onDeleteConversation(conversation.id);
      if (onBack) {
        onBack(); // Navigate back after deletion
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {partner && (
              <>
                <div className="relative">
                  <Image
                    src={partner.headshot_image 
                      ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${partner.headshot_image}?t=${Date.now()}`
                      : '/placeholder-avatar.png'
                    }
                    alt={partner.full_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.png';
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                    partner.is_online ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{partner.full_name}</h3>
                  <p className="text-sm text-gray-500">
                    {partner.is_online ? 'Online' : 
                     partner.last_seen ? `Last seen ${new Date(partner.last_seen).toLocaleString()}` : 'Last seen recently'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {conversation.job_postings && (
              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <i className="fas fa-briefcase mr-1"></i>
                {conversation.job_postings.title}
              </div>
            )}
            
            {/* Delete conversation button */}
            <button
              onClick={() => {
                if (confirm(`Hide this conversation with ${partner?.full_name}? You can still be messaged by this user.`)) {
                  handleDeleteConversation();
                }
              }}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              title="Hide conversation"
            >
              <i className="fas fa-trash"></i>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all md:hidden"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                {new Date(date).toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar = !isOwn && (
                index === dayMessages.length - 1 || 
                dayMessages[index + 1]?.sender_id !== message.sender_id
              );

              return (
                <div key={message.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && partner && (
                        <Image
                          src={partner.headshot_image 
                            ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${partner.headshot_image}?t=${Date.now()}`
                            : '/placeholder-avatar.png'
                          }
                          alt={partner.full_name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    {message.message_type === 'image' && message.file_url && (
                      <div className="mb-2">
                        <Image
                          src={message.file_url}
                          alt="Shared image"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}

                    {message.message_type === 'file' && message.file_url && (
                      <div className="mb-2 p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-file text-lg"></i>
                          <div className="flex-1">
                            <a 
                              href={message.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline"
                            >
                              Download File
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-sm">{message.content}</p>

                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatMessageTime(message.created_at)}</span>
                      {isOwn && (
                        <i className={`fas ${
                          message.status === 'read' ? 'fa-check-double text-blue-200' :
                          message.status === 'delivered' ? 'fa-check-double' : 'fa-check'
                        }`}></i>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {partnerTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex-shrink-0"></div>
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {canSendMessage ? (
        <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
          {/* File preview */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className={`fas ${selectedFile.type.startsWith('image/') ? 'fa-image' : 'fa-file'} text-blue-600`}></i>
                <span className="text-sm text-blue-800">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              {/* File attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                disabled={uploadingFile}
              >
                <i className="fas fa-paperclip"></i>
              </button>
            </div>

            <button
              onClick={sendMessage}
              disabled={sending || uploadingFile || (!newMessage.trim() && !selectedFile)}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending || uploadingFile ? (
                <i className="fas fa-spinner animate-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
          <p className="text-gray-600 text-sm">
            <i className="fas fa-lock mr-2"></i>
            You can only reply to conversations initiated by creators or producers
          </p>
        </div>
      )}
    </div>
  );
}