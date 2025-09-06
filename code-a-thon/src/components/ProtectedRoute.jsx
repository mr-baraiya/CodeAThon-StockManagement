import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false, requiredRole = null }) => {
  const { isAuthenticated, isAdmin, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    // Redirect to dashboard if user is not admin
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
