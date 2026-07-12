import React, { useState } from 'react';
import Sidebar from '../../components/chat/Sidebar';
import ChatArea from '../../components/chat/ChatArea';
import { useChat } from '../../context/ChatContext';
import { X } from 'lucide-react';

const ChatPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { notification, setNotification } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a13] text-slate-100">
      
      {/* Toast notification banner */}
      {notification && (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm w-80 items-center gap-3 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md animate-bounce-in">
          <img
            src={notification.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.senderName)}`}
            alt={notification.senderName}
            className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-700/50"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">New Message</h4>
            <p className="text-xs font-semibold text-white truncate">{notification.senderName}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{notification.messageText}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Desktop Sidebar (1/4 or fixed 320px width) */}
      <div className="hidden h-full w-[320px] shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop Blur overlay */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          ></div>

          {/* Drawer Content */}
          <div className="relative flex h-full w-[280px] flex-col shadow-2xl animate-slide-in">
            <div className="flex-1 h-full">
              <Sidebar onMobileClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Chat Area Panel (Takes remaining space) */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <ChatArea onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      </div>
    </div>
  );
};

export default ChatPage;
