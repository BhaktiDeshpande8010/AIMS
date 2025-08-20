import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Authenticate user
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Authorize based on roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

// Accounts or Admin middleware
export const accountsOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (!['admin', 'accounts'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Accounts or Admin privileges required.'
    });
  }

  next();
};

// Check delete permission (Admin only)
export const canDelete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (!req.user.permissions.canDelete) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Delete permission required. Only administrators can delete records.'
    });
  }

  next();
};

// Check approval permission (Admin only)
export const canApprove = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (!req.user.permissions.canApprove) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Approval permission required. Only administrators can approve requests.'
    });
  }

  next();
};

// Optional authentication (for public routes that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but that's okay for optional auth
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue even if there's an error
  }
};

// Rate limiting for login attempts
export const loginRateLimit = (req, res, next) => {
  // This is a simple implementation
  // In production, you might want to use redis or a more sophisticated solution
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  const key = `login_attempts_${req.ip}`;
  
  // For now, we'll just proceed
  // You can implement proper rate limiting here
  next();
};

// Middleware to log user actions
export const logUserAction = (action) => {
  return (req, res, next) => {
    // Store action info for logging
    req.userAction = {
      action,
      userId: req.user?._id,
      userRole: req.user?.role,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    next();
  };
};

export default {
  authenticate,
  authorize,
  checkPermission,
  adminOnly,
  accountsOrAdmin,
  canDelete,
  canApprove,
  optionalAuth,
  loginRateLimit,
  logUserAction
};
