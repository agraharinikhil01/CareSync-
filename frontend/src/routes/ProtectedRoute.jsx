import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleDefaultRedirects = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PATIENT: '/patient/dashboard',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f7]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#0087be] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#646970]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = roleDefaultRedirects[user.role] || '/login';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
