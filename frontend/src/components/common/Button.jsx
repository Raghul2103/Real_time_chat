import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '', variant = 'primary' }) => {
  const baseStyle = 'flex items-center justify-center font-semibold rounded-xl transition duration-150 focus:outline-none';
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50 disabled:opacity-40',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
