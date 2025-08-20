import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  toggleUserStatus
} from '../controllers/authController.js';
import {
  authenticate,
  adminOnly,
  loginRateLimit,
  logUserAction
} from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', logUserAction('USER_REGISTER'), register);
router.post('/login', loginRateLimit, logUserAction('USER_LOGIN'), login);
router.post('/logout', logUserAction('USER_LOGOUT'), logout);

// Protected routes (require authentication)
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, logUserAction('PROFILE_UPDATE'), updateProfile);
router.put('/change-password', authenticate, logUserAction('PASSWORD_CHANGE'), changePassword);

// Admin only routes
router.get('/users', authenticate, adminOnly, getAllUsers);
router.put('/users/:userId/role', authenticate, adminOnly, logUserAction('USER_ROLE_UPDATE'), updateUserRole);
router.put('/users/:userId/status', authenticate, adminOnly, logUserAction('USER_STATUS_TOGGLE'), toggleUserStatus);

export default router;
