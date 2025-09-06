
'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Loading Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading messages...</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const variants = {
    unread: 'bg-red-100 text-red-800 border-red-200',
    read: 'bg-blue-100 text-blue-800 border-blue-200',
    replied: 'bg-green-100 text-green-800 border-green-200',
    archived: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const variant = variants[status] || variants.unread;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant}`}>
      {status}
    </span>
  );
};

const EmailHistory = ({ messageId }) => {
  const [emailReplies, setEmailReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailContent, setShowEmailContent] = useState({});

  useEffect(() => {
    const fetchEmailReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_replies')
          .select(`
            *,
            profiles:sender_id (
              full_name,
              email
            )
          `)
          .eq('contact_submission_id', messageId)
          .order('sent_at', { ascending: true });

        if (error) throw error;
        setEmailReplies(data || []);
      } catch (err) {
        console.error('Error fetching email replies:', err);
      } finally {
        setLoading(false);
      }
    };

    if (messageId) {
      fetchEmailReplies();
    }
  }, [messageId]);

  const toggleEmailContent = (replyId) => {
    setShowEmailContent(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  if (loading) {
    return (
      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading email history...</span>
        </div>
      </div>
    );
  }

  if (emailReplies.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-6 mb-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <i className="fas fa-history text-gray-600 mr-2"></i>
        Email Reply History ({emailReplies.length})
      </h4>
      
      <div className="space-y-4">
        {emailReplies.map((reply) => (
          <div key={reply.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-paper-plane mr-2"></i>
                <span className="font-medium">
                  Sent by {reply.profiles?.full_name || 'Admin'}
                </span>
                <span className="mx-2">•</span>
                <span>{new Date(reply.sent_at).toLocaleString()}</span>
                <span className="mx-2">•</span>
                <span className="capitalize text-green-600 font-medium">
                  {reply.delivery_status}
                </span>
              </div>
              <button
                onClick={() => toggleEmailContent(reply.id)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                {showEmailContent[reply.id] ? 'Hide' : 'View'} Email Content
              </button>
            </div>
            
            <div className="text-sm text-gray-700 mb-2">
              <strong>Subject:</strong> {reply.subject}
            </div>
            
            <div className="text-sm text-gray-700 mb-3">
              <strong>Reply Content:</strong>
              <div className="mt-1 p-3 bg-white rounded border text-gray-800">
                {reply.reply_content}
              </div>
            </div>

            {showEmailContent[reply.id] && (
              <div className="mt-4 border-t border-gray-300 pt-4">
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Full Email HTML (as sent):</h5>
                  <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <iframe
                      srcDoc={reply.email_html}
                      className="w-full h-64 border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Plain Text Version:</h5>
                  <div className="bg-white border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {reply.email_text}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

const MessageDetailModal = ({ message, isOpen, onClose, onReply, onStatusChange }) => {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      await onReply(message.id, replyText);
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <i className="fas fa-envelope text-purple-600 mr-3"></i>
              Message Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Message Header */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
                <div className="flex items-center">
                  <i className="fas fa-user text-gray-400 mr-2"></i>
                  <span className="font-medium">{message.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                <div className="flex items-center">
                  <i className="fas fa-envelope text-gray-400 mr-2"></i>
                  <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                    {message.email}
                  </a>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                <div className="flex items-center">
                  <i className="fas fa-tag text-gray-400 mr-2"></i>
                  <span>{message.subject}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                <div className="flex items-center">
                  <i className="fas fa-calendar text-gray-400 mr-2"></i>
                  <span>{new Date(message.created_at).toLocaleDateString()}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={message.status || 'unread'} />
              <div className="flex gap-2">
                <select
                  value={message.status || 'unread'}
                  onChange={(e) => onStatusChange(message.id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {message.message}
              </p>
            </div>
          </div>

          {/* Email History */}
          {message.status === 'replied' && (
            <EmailHistory messageId={message.id} />
          )}

          {/* Reply Form */}
          <div className="border-t border-gray-200 pt-6">
            <form onSubmit={handleReply}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply to {message.name}:
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={6}
                disabled={sending}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  This will send the reply directly to {message.name} at {message.email}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminContactManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError('Failed to fetch messages: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Utility functions
  const showMessage = useCallback((message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  }, []);

  // Handle message actions
  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: newStatus } : msg
      ));
      
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: newStatus }));
      }
      
      showMessage('Message status updated successfully!');
    } catch (err) {
      showMessage('Failed to update status: ' + err.message, true);
    }
  };

  const handleReply = async (messageId, replyText) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Send email directly through API
      const response = await fetch('/api/send-contact-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          replyText,
          recipientEmail: message.email,
          recipientName: message.name,
          originalSubject: message.subject,
          originalMessage: message.message
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);

      // Update status to replied
      await handleStatusChange(messageId, 'replied');
      
      showMessage('Reply sent successfully!');
      setIsModalOpen(false);
    } catch (err) {
      showMessage('Failed to send reply: ' + err.message, true);
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      showMessage('Message deleted successfully!');
      
      if (selectedMessage && selectedMessage.id === messageId) {
        setIsModalOpen(false);
        setSelectedMessage(null);
      }
    } catch (err) {
      showMessage('Failed to delete message: ' + err.message, true);
    }
  };

  // Filter and paginate messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (message.status || 'unread') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort messages
  filteredMessages.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortBy === 'created_at') {
      return new Date(bVal) - new Date(aVal);
    }
    return String(aVal).localeCompare(String(bVal));
  });

  // Paginate
  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Statistics
  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.status || m.status === 'unread').length,
    replied: messages.filter(m => m.status === 'replied').length,
    thisWeek: messages.filter(m => {
      const created = new Date(m.created_at);
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return created > week;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle mr-3"></i>
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-3"></i>
            {success}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="fas fa-envelope text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Unread</p>
              <p className="text-3xl font-bold text-gray-900">{stats.unread}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Replied</p>
              <p className="text-3xl font-bold text-gray-900">{stats.replied}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-reply text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <i className="fas fa-calendar text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="fas fa-inbox text-purple-600 mr-3"></i>
            Contact Messages
          </h2>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search messages by name, email, subject, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="created_at">Recent First</option>
              <option value="name">Name (A-Z)</option>
              <option value="subject">Subject (A-Z)</option>
              <option value="email">Email (A-Z)</option>
            </select>
          </div>

          {/* Messages Table */}
          {loading ? (
            <LoadingSpinner />
          ) : paginatedMessages.length === 0 ? (
            <div className="text-center py-16">
              <i className="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {filteredMessages.length === 0 && messages.length === 0 
                  ? 'No messages yet' 
                  : 'No messages match your filters'}
              </h3>
              <p className="text-gray-600">
                {messages.length === 0 
                  ? 'Contact form messages will appear here.' 
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{message.name}</div>
                            <div className="text-sm text-gray-500">{message.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate">{message.subject}</div>
                            <div className="text-sm text-gray-500 truncate">{message.message}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={message.status || 'unread'} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{new Date(message.created_at).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(message.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsModalOpen(true);
                              if (!message.status || message.status === 'unread') {
                                handleStatusChange(message.id, 'read');
                              }
                            }}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                            title="View & Reply"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium"
                            title="Delete Message"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
