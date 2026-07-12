import React from 'react';

const TypingIndicator = ({ name }) => {
  return (
    <div className="flex items-center gap-2.5 py-2 pl-3 select-none">
      {/* Animated Bouncing Dots */}
      <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/30 rounded-2xl px-4 py-2.5 shadow-sm">
        <span className="text-xs font-medium text-slate-400 mr-1">{name || 'Someone'} is typing</span>
        <div className="flex gap-1 items-center h-2">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
