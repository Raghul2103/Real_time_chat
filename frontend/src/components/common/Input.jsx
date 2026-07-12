import React from 'react';

const Input = ({ id, type = 'text', label, value, onChange, placeholder = '', required = false, icon: Icon, className = '', error }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {label}
        </label>
      )}
      <div className="relative mt-2">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-slate-500" />
          </div>
        )}
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded-xl border bg-slate-900/50 py-3 text-white placeholder-slate-500 transition focus:outline-none focus:ring-1 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-chat-border focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </div>
  );
};

export default Input;
