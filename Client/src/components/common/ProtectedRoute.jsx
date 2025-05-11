import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Redirect to role-specific dashboard if user has different role
    switch(user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'lecturer':
        return <Navigate to="/lecturer/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;