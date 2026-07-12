import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { Check, CheckCheck } from 'lucide-react';

const ChatBubble = ({ msg }) => {
  const { user } = useAuth();
  
  if (!user || !msg) return null;

  const isMe = msg.sender && msg.sender._id === user._id;
  const timeStr = formatTime(msg.createdAt);

  return (
    <div className={`flex w-full gap-3 py-1 animate-fade-in ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Sender Avatar (Only for received messages) */}
      {!isMe && (
        <img
          src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'User')}`}
          alt={msg.sender?.name || 'Sender'}
          className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0 align-bottom self-end"
        />
      )}

      {/* Message Content Container */}
      <div className={`flex max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (Only in Global Chat for others) */}
        {!isMe && msg.type === 'global' && (
          <span className="mb-1 pl-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {msg.sender?.name || 'Anonymous'}
          </span>
        )}

        {/* Bubble Text */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed ${
            isMe
              ? 'rounded-br-sm bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
              : 'rounded-bl-sm bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/30 dark:border-slate-700/30 text-slate-800 dark:text-slate-100'
          }`}
        >
          <p className="break-words">{msg.message}</p>
          
          {/* Timestamp and Receipt indicators inside the bubble for compactness */}
          <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[10px] select-none opacity-70">
            <span>{timeStr}</span>
            {isMe && msg.type === 'private' && (
              <span>
                {msg.read ? (
                  <CheckCheck className="h-3.5 w-3.5 text-cyan-400 font-bold" />
                ) : msg.delivered ? (
                  <CheckCheck className="h-3.5 w-3.5 text-slate-300" />
                ) : (
                  <Check className="h-3.5 w-3.5 text-slate-500" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
