import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireRole = null, 
  requirePermission = null,
  fallbackPath = '/login'
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requireRole && (!user || user.role !== requireRole)) {
    // Redirect based on user's actual role
    if (user) {
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check permission requirement
  if (requirePermission && (!user || !user.permissions || !user.permissions[requirePermission])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required permission: {requirePermission}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// Specific route protection components
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requireRole="admin" fallbackPath="/login">
    {children}
  </ProtectedRoute>
);

export const AccountsRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
);

export const DeleteProtectedRoute = ({ children }) => (
  <ProtectedRoute requirePermission="canDelete">
    {children}
  </ProtectedRoute>
);

export const ApprovalProtectedRoute = ({ children }) => (
  <ProtectedRoute requirePermission="canApprove">
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
