import api from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('token', response.data.data.token);
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and headers regardless of API call success
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users (Admin only)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/auth/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user role (Admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/auth/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle user status (Admin only)
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.put(`/auth/users/${userId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getStoredUser();
    return user && user.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole('admin');
  },

  // Check if user is accounts
  isAccounts: () => {
    return authService.hasRole('accounts');
  },

  // Check if user has specific permission
  hasPermission: (permission) => {
    const user = authService.getStoredUser();
    return user && user.permissions && user.permissions[permission];
  },

  // Check if user can delete
  canDelete: () => {
    return authService.hasPermission('canDelete');
  },

  // Check if user can approve
  canApprove: () => {
    return authService.hasPermission('canApprove');
  },

  // Check if user can access admin portal
  canAccessAdmin: () => {
    return authService.hasPermission('canAccessAdmin');
  },

  // Check if user can access accounts portal
  canAccessAccounts: () => {
    return authService.hasPermission('canAccessAccounts');
  },

  // Initialize auth state (call this on app startup)
  initializeAuth: () => {
    const token = authService.getStoredToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  // Clear auth state
  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export default authService;
