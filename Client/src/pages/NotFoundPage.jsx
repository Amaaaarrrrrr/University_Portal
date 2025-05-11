import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;