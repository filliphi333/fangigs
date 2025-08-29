
'use client';
import { useState } from 'react';
import { ConversationUtils } from '../lib/conversationUtils';
import { useRouter } from 'next/navigation';

export default function MessageButton({ 
  currentUserId, 
  recipientId, 
  jobId = null, 
  buttonText = "Message", 
  buttonStyle = "default",
  disabled = false,
  onSuccess = null 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleMessage = async () => {
    if (!currentUserId) {
      router.push('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check permissions first
      const { canMessage, reason } = await ConversationUtils.canInitiateConversation(
        currentUserId, 
        recipientId, 
        jobId
      );

      if (!canMessage) {
        setError(reason);
        setLoading(false);
        return;
      }

      // Find or create conversation
      const { conversation } = await ConversationUtils.findOrCreateConversation(
        currentUserId, 
        recipientId, 
        jobId
      );

      // Navigate to the conversation
      router.push(`/messages/${conversation.id}`);

      if (onSuccess) {
        onSuccess(conversation);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (buttonStyle) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500`;
      case 'small':
        return `${baseClasses} text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200`;
      case 'collab':
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700`;
      default:
        return `${baseClasses} border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500`;
    }
  };

  const getButtonText = () => {
    if (loading) return 'Starting...';
    if (jobId) return buttonText || 'Ask Question';
    return buttonText;
  };

  return (
    <div className="relative">
      <button
        onClick={handleMessage}
        disabled={disabled || loading || !currentUserId}
        className={getButtonClasses()}
      >
        {loading ? (
          <i className="fas fa-spinner animate-spin"></i>
        ) : (
          <i className="fas fa-comment"></i>
        )}
        {getButtonText()}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 rounded-lg p-2 text-sm text-red-700 z-10 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
