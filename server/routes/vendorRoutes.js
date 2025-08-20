// agri-drone-accounts/server/routes/vendorRoutes.js
import express from 'express';
import {
  getVendors,
  createVendor,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorsByType,
  activateVendor,
  deactivateVendor,
  sendOTP,
  verifyOTP
} from '../controllers/vendorController.js';

const router = express.Router();

// OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// CRUD routes
router.get('/', getVendors);
router.post('/', createVendor);
router.get('/type/:type', getVendorsByType);
router.get('/:id', getVendorById);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

// Status management routes
router.patch('/:id/activate', activateVendor);
router.patch('/:id/deactivate', deactivateVendor);

export default router;
