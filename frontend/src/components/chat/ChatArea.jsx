import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import { Send, Menu, ShieldAlert, Sparkles, Smile } from 'lucide-react';

const ChatArea = ({ onMobileToggle }) => {
  const { user } = useAuth();
  const {
    activeChat,
    messages,
    typingStatus,
    loadingMessages,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
  } = useChat();

  const [text, setText] = useState('');
  const [isTypingSelf, setIsTypingSelf] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);

  // Clean typing timeouts on unmount or chat switch
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeChat]);

  // Handle typing state change
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!isTypingSelf) {
      setIsTypingSelf(true);
      sendTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
      setIsTypingSelf(false);
    }, 1500);
  };

  // Submit handler
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage(text);
    
    // Stop typing immediately on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStop();
    setIsTypingSelf(false);
    
    setText('');
  };

  if (!activeChat) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-500 dark:text-slate-400">
        <Sparkles className="mb-4 h-12 w-12 text-indigo-500/50" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Chat Selected</h3>
        <p className="mt-1 text-sm text-slate-500">Pick a workspace or contact from the sidebar to start chatting</p>
      </div>
    );
  }

  // Determine header labels
  const chatTitle = activeChat.type === 'global' ? 'Global Space' : activeChat.user?.name;
  const chatSubtitle = activeChat.type === 'global' ? 'Public room • Everyone can see' : activeChat.user?.isOnline ? 'Online now' : 'Offline';

  // Determine if other users are typing in current conversation
  let typingUser = null;
  if (activeChat.type === 'global') {
    // Find first typing user in global list who is not me
    const typingIds = Object.keys(typingStatus).filter(
      (id) => id !== user?._id && typingStatus[id]?.isTyping && typingStatus[id]?.isGlobal
    );
    if (typingIds.length > 0) {
      // Find user name from users list
      const firstTypingUser = messages.find((m) => m.sender?._id === typingIds[0])?.sender;
      typingUser = firstTypingUser?.name || 'Someone';
    }
  } else if (activeChat.type === 'private' && activeChat.user) {
    // Check if the specific private contact is typing
    const contactId = activeChat.user._id;
    if (typingStatus[contactId]?.isTyping && !typingStatus[contactId]?.isGlobal) {
      typingUser = activeChat.user.name;
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Chat Area Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={onMobileToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Target Status Avatar */}
          <div className="relative">
            {activeChat.type === 'global' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Menu className="h-5 w-5 rotate-90" /> {/* global logo fallback */}
              </div>
            ) : (
              <img
                src={activeChat.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.user?.name || '')}`}
                alt={chatTitle}
                className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
              />
            )}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 ${
                activeChat.type === 'global'
                  ? 'bg-indigo-500'
                  : activeChat.user?.isOnline
                  ? 'bg-emerald-500'
                  : 'bg-slate-400 dark:bg-slate-600'
              }`}
            ></span>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{chatTitle}</h4>
            <span className={`text-[11px] font-medium ${activeChat.user?.isOnline ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {chatSubtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Message List Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-white dark:bg-slate-950">
        {loadingMessages ? (
          /* Loading Skeleton Screens */
          <div className="space-y-4">
            <div className="flex justify-start gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              <div className="space-y-2 max-w-[60%]">
                <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                <div className="h-12 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="h-16 w-56 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            </div>
            <div className="flex justify-start gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              <div className="space-y-2 max-w-[60%]">
                <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Chat History is Empty Alert */
          <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
            <Smile className="mb-3 h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">Start of conversation</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Send a message to break the ice</p>
          </div>
        ) : (
          /* Messages feed */
          messages.map((msg) => <ChatBubble key={msg._id} msg={msg} />)
        )}

        {/* Dynamic Typing notifications */}
        {typingUser && <TypingIndicator name={typingUser} />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Text Input Form */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder={`Message ${activeChat.type === 'global' ? 'Global Space' : chatTitle}...`}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition focus:border-indigo-500/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg transition duration-200 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
