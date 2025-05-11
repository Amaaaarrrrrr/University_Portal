import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  fullWidth = true,
  className = '',
  icon,
  ...props
}, ref) => {
  const inputClasses = `px-3 py-2 bg-white border shadow-sm border-gray-300 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md ${
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
  } ${fullWidth ? 'w-full' : ''}`;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input 
          ref={ref}
          className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
