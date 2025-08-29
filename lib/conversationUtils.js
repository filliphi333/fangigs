
import { supabase } from './supabase';

export const ConversationUtils = {
  // Find or create a conversation between two users
  async findOrCreateConversation(participant1Id, participant2Id, jobId = null) {
    try {
      // First, try to find existing conversation
      let query = supabase
        .from('conversations')
        .select('*')
        .or(`and(participant1.eq.${participant1Id},participant2.eq.${participant2Id}),and(participant1.eq.${participant2Id},participant2.eq.${participant1Id})`)
        .eq('status', 'active');

      // If jobId is provided, include it in the search
      if (jobId) {
        query = query.eq('job_id', jobId);
      } else {
        query = query.is('job_id', null);
      }

      const { data: existingConv, error: findError } = await query.single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      // If conversation exists, return it
      if (existingConv) {
        return { conversation: existingConv, isNew: false };
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1: participant1Id,
          participant2: participant2Id,
          job_id: jobId,
          initiator_id: participant1Id,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      return { conversation: newConv, isNew: true };
    } catch (error) {
      console.error('Error finding/creating conversation:', error);
      throw error;
    }
  },

  // Send initial message and handle conversation creation
  async initiateConversation(senderId, recipientId, content, jobId = null, messageType = 'text') {
    try {
      // Find or create conversation
      const { conversation, isNew } = await this.findOrCreateConversation(senderId, recipientId, jobId);

      // Send the initial message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: senderId,
          recipient_id: recipientId,
          content: content,
          message_type: messageType
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update conversation's last message info
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_sender: senderId,
          last_message_at: new Date().toISOString(),
          // Increment unread count for recipient
          ...(conversation.participant1 === recipientId 
            ? { unread_count_p1: (conversation.unread_count_p1 || 0) + 1 }
            : { unread_count_p2: (conversation.unread_count_p2 || 0) + 1 }
          )
        })
        .eq('id', conversation.id);

      return { conversation, message, isNew };
    } catch (error) {
      console.error('Error initiating conversation:', error);
      throw error;
    }
  },

  // Check if user can message another user
  async canInitiateConversation(senderId, recipientId, jobId = null) {
    try {
      // Get both user profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, type, open_to_messages')
        .in('id', [senderId, recipientId]);

      if (error) throw error;

      const sender = profiles.find(p => p.id === senderId);
      const recipient = profiles.find(p => p.id === recipientId);

      if (!sender || !recipient) {
        return { canMessage: false, reason: 'User not found' };
      }

      // Creators/Producers can message talents
      if (sender.type === 'creator' && recipient.type === 'talent') {
        return { canMessage: true };
      }

      // If it's a job-related conversation, check if talent applied
      if (jobId) {
        const { data: application } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('user_id', senderId)
          .single();

        if (application) {
          return { canMessage: true, reason: 'Applied to job' };
        }
      }

      // Check if recipient is open to messages
      if (recipient.open_to_messages) {
        return { canMessage: true, reason: 'Open to messages' };
      }

      return { canMessage: false, reason: 'Not authorized to message this user' };
    } catch (error) {
      console.error('Error checking message permissions:', error);
      return { canMessage: false, reason: 'Error checking permissions' };
    }
  },

  // Auto-create conversation when talent applies to job
  async handleJobApplication(talentId, jobId, producerId) {
    try {
      const content = `I've applied to your job posting. Looking forward to hearing from you!`;
      
      const result = await this.initiateConversation(
        talentId, 
        producerId, 
        content, 
        jobId, 
        'application'
      );

      return result;
    } catch (error) {
      console.error('Error handling job application conversation:', error);
      throw error;
    }
  }
};
