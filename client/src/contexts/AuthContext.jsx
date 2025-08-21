import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Initialize auth service
      authService.initializeAuth();
      
      // Check if user is stored locally
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();
      
      if (storedUser && token) {
        // For initial load, trust stored user to prevent API loops
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        return response;
      }
      throw new Error(response.message || 'Profile update failed');
    } catch (error) {
      throw error;
    }
  };

  // Permission checking functions
  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasPermission = (permission) => {
    return user && user.permissions && user.permissions[permission];
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isAccounts = () => {
    return hasRole('accounts');
  };

  const canDelete = () => {
    return hasPermission('canDelete');
  };

  const canApprove = () => {
    return hasPermission('canApprove');
  };

  const canAccessAdmin = () => {
    return hasPermission('canAccessAdmin');
  };

  const canAccessAccounts = () => {
    return hasPermission('canAccessAccounts');
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    updateProfile,
    
    // Permission checks
    hasRole,
    hasPermission,
    isAdmin,
    isAccounts,
    canDelete,
    canApprove,
    canAccessAdmin,
    canAccessAccounts
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
