import React from 'react';

const Button = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white',
    secondary: 'bg-white/30 backdrop-blur-sm hover:bg-white/40 text-gray-700 border border-white/40',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
  };

  return (
    <button
      className={`
        relative overflow-hidden px-6 py-3 rounded-2xl font-semibold
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </button>
  );
};

export default Button;