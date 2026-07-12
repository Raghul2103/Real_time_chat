import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { LogOut, Globe, MessageSquare, Search, Sparkles, X, Sun, Moon } from 'lucide-react';

const Sidebar = ({ onMobileClose }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { users, activeChat, selectChat } = useChat();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'private'

  if (!user) return null;

  // Filter users by search query
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectChat = (chatTarget) => {
    selectChat(chatTarget);
    if (onMobileClose) {
      onMobileClose(); // close drawer on mobile selection
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
      {/* Sidebar Header (Auth Profile Card) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="h-10 w-10 rounded-full border border-indigo-500/30 object-cover"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-50 dark:border-slate-900 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[130px]">
              {user.name}
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3 w-3" /> Online
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </button>

          {/* Logout Trigger */}
          <button
            onClick={logout}
            title="Sign Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Mobile Drawer Close */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              title="Close Menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-2 gap-1 border-b border-slate-200 dark:border-slate-800 p-3">
        <button
          onClick={() => {
            setActiveTab('global');
            handleSelectChat({ type: 'global' });
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition ${
            activeTab === 'global' && activeChat.type === 'global'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/10'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" /> Global Space
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition ${
            activeTab === 'private' || activeChat.type === 'private'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/10'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Direct Chat
        </button>
      </div>

      {/* Contacts List Area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {activeTab === 'global' ? (
          /* Global Channel Active Info */
          <div className="p-4">
            <button
              onClick={() => handleSelectChat({ type: 'global' })}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition duration-200 ${
                activeChat.type === 'global'
                  ? 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 dark:text-white'
                  : 'border border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">Global Lobby</p>
                <p className="text-xs text-slate-500">Public group messaging</p>
              </div>
            </button>
          </div>
        ) : (
          /* Direct Private Channels Active Info */
          <div className="flex flex-1 flex-col">
            {/* Search Box */}
            <div className="px-4 py-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition focus:border-indigo-500/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Scrollable contacts */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">No contacts found</p>
                </div>
              ) : (
                filteredUsers.map((item) => {
                  const isActive = activeChat.type === 'private' && activeChat.user && activeChat.user._id === item._id;
                  return (
                    <button
                      key={item._id}
                      onClick={() => handleSelectChat({ type: 'private', user: item })}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition duration-200 ${
                        isActive
                          ? 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 dark:text-white'
                          : 'border border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {/* Contact Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}`}
                          alt={item.name}
                          className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                        />
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-50 dark:border-slate-905 ${
                            item.isOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                          }`}
                        ></span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                          {item.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {item.isOnline ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
