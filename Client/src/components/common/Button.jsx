import React, { forwardRef } from 'react';

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
