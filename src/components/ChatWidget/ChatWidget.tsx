import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, Clock, Calendar, CheckSquare } from 'lucide-react';
import apiClient from '@/lib/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/chat', {
        message: inputValue,
        conversation_id: conversationId || null,
      });

      if (response.data.conversation_id && !conversationId) {
        setConversationId(response.data.conversation_id);
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-full max-w-sm sm:max-w-md md:w-96 h-[480px] bg-gray-800 text-white rounded-xl shadow-2xl shadow-cyan-500/30 flex flex-col border border-cyan-400/20 overflow-hidden backdrop-blur-sm bg-gray-800/95">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-t-xl flex justify-between items-center border-b border-cyan-400/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Task Forge AI Assistant</h3>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={startNewConversation}
                className="text-white/90 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg group relative"
                aria-label="Start new conversation"
                title="New Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg group relative"
                aria-label="Close chat"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900 to-gray-900/95">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-cyan-500 to-blue-500 p-4 rounded-2xl shadow-2xl">
                      <Bot size={40} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Hello! I'm your AI Task Manager
                  </h2>
                  <p className="text-gray-300 mb-6 text-sm">Ask me to manage your tasks, schedule, or get things done!</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xs">
                    <button
                      onClick={() => handleQuickAction("Add a meeting with John tomorrow at 2 PM")}
                      className="p-3 bg-gray-800 rounded-xl hover:bg-cyan-500/10 transition-all duration-200 border border-gray-600 hover:border-cyan-400/50 text-left group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-sm">Add Meeting</span>
                      </div>
                      <p className="text-xs text-gray-400">Schedule appointments</p>
                    </button>
                    
                    <button
                      onClick={() => handleQuickAction("List all pending tasks")}
                      className="p-3 bg-gray-800 rounded-xl hover:bg-cyan-500/10 transition-all duration-200 border border-gray-600 hover:border-cyan-400/50 text-left group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckSquare size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-sm">View Tasks</span>
                      </div>
                      <p className="text-xs text-gray-400">Check pending items</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-gray-800/80 border border-gray-600/50 backdrop-blur-sm'
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          {msg.role === 'assistant' && (
                            <div className="mt-0.5 p-1 bg-cyan-500/10 rounded-full">
                              <Bot size={12} className="text-cyan-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-xs ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                          {msg.role === 'user' && (
                            <div className="p-1 bg-white/20 rounded-full">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-white/80 flex items-center justify-center">
                                <span className="text-xs font-bold text-cyan-500">U</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isLoading && (
                  <div className="flex justify-start mt-3">
                    <div className="max-w-[85%] bg-gray-800/80 border border-gray-600/50 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-cyan-500/10 rounded-full">
                          <Bot size={14} className="text-cyan-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1.5">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm text-gray-300">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-cyan-400/20 bg-gray-800/80 backdrop-blur-sm">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-900/50 text-white border-2 border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all text-sm placeholder-gray-500"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl w-12 h-12 flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none group"
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
              >
                <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-105"
          aria-label="Open chat"
        >
          <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MessageCircle size={24} className="relative z-10" />
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-600">
            Chat with AI
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;