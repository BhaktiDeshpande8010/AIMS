import express from 'express';
import {
  getAdminDashboard,
  getPendingApprovals,
  approveItem,
  rejectItem,
  getSystemLogs,
  getSystemStats,
  approveCustomer,
  rejectCustomer,
  getPendingCustomers
} from '../controllers/adminController.js';
import {
  authenticate,
  adminOnly,
  canApprove
} from '../middleware/auth.js';
import {
  logSystemAction
} from '../middleware/logging.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Dashboard routes
router.get('/dashboard', getAdminDashboard);
router.get('/stats', getSystemStats);

// Approval management routes
router.get('/approvals', getPendingApprovals);
router.post('/approve/:type/:id', canApprove, logSystemAction('ADMIN_APPROVE', 'Approved item', 'HIGH'), approveItem);
router.post('/reject/:type/:id', canApprove, logSystemAction('ADMIN_REJECT', 'Rejected item', 'HIGH'), rejectItem);

// Customer approval routes
router.get('/customers/pending', getPendingCustomers);
router.post('/customers/:id/approve', canApprove, logSystemAction('CUSTOMER_APPROVE', 'Approved customer', 'HIGH'), approveCustomer);
router.post('/customers/:id/reject', canApprove, logSystemAction('CUSTOMER_REJECT', 'Rejected customer', 'HIGH'), rejectCustomer);

// System logs routes
router.get('/logs', getSystemLogs);

export default router;
