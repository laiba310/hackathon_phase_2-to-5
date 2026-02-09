import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  // Base classes for all buttons
  let baseClasses = 'font-bold px-6 py-3 rounded-full shadow-sm hover:brightness-105 transition-all active:scale-95';
  
  // Variant-specific classes
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = disabled 
        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50';
      break;
    case 'secondary':
      variantClasses = disabled 
        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 hover:border-cyan-400/50';
      break;
    case 'danger':
      variantClasses = disabled 
        ? 'bg-red-700 text-red-400 cursor-not-allowed' 
        : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50';
      break;
    default:
      variantClasses = 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50';
  }

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
};