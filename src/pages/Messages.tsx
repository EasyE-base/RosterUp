import { useEffect, useState, useRef } from 'react';
import {
  Search,
  Send,
  Plus,
  Users,
  MoreVertical,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    email: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    full_name: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markAsRead(selectedConversation);

      const channel = supabase
        .channel(`conversation:${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation}`,
          },
          (payload) => {
            loadMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);

      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user?.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map((p) => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id, profiles(id, full_name, email)')
            .eq('conversation_id', conv.id)
            .neq('user_id', user?.id)
            .single();

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user?.id)
            .eq('is_read', false);

          return {
            ...conv,
            other_user: (otherParticipant as any)?.profiles || {
              id: '',
              full_name: 'Unknown User',
              email: '',
            },
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(full_name)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user?.id);

      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user?.id,
        content: messageText.trim(),
      });

      if (error) throw error;

      setMessageText('');
      await loadMessages(selectedConversation);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id)
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      const existingConversationUserIds = conversations.map((c) => c.other_user.id);
      const filteredResults = (data || []).filter(
        (u) => !existingConversationUserIds.includes(u.id)
      );

      setUserSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      const { error: participant1Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user?.id,
        });

      if (participant1Error) throw participant1Error;

      const { error: participant2Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: otherUserId,
        });

      if (participant2Error) throw participant2Error;

      setShowNewMessageModal(false);
      setSearchTerm('');
      setUserSearchResults([]);
      await loadConversations();
      setSelectedConversation(conversation.id);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation');
    }
  };

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-800/50 flex flex-col">
              <div className="p-4 border-b border-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="p-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No conversations yet</p>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Start a conversation
                    </button>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 border-b border-slate-800/50 cursor-pointer transition-all ${
                        selectedConversation === conversation.id
                          ? 'bg-blue-500/10 border-l-4 border-l-blue-500'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {conversation.other_user.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-semibold truncate">
                              {conversation.other_user.full_name}
                            </h3>
                            {conversation.last_message && (
                              <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                {formatTime(conversation.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400 truncate">
                              {conversation.last_message?.content || 'No messages yet'}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="hidden md:flex flex-col flex-1">
              {selectedConversation && selectedConvData ? (
                <>
                  <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedConvData.other_user.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {selectedConvData.other_user.full_name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {selectedConvData.other_user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md ${
                              isOwn
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                : 'bg-slate-800/50'
                            } rounded-lg p-3`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold text-blue-400 mb-1">
                                {message.sender.full_name}
                              </p>
                            )}
                            <p className="text-white text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-slate-800/50">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Type your message..."
                          rows={3}
                          className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !messageText.trim()}
                        className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Press Enter to send, Shift + Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-slate-400">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">New Message</h2>
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSearchTerm('');
                  setUserSearchResults([]);
                  setError('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Search for users
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSearchUsers}
                    disabled={searching || !searchTerm.trim()}
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>

              {userSearchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Search Results</h3>
                  {userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{user.full_name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartConversation(user.id)}
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
