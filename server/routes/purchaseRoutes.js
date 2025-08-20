// agri-drone-accounts/server/routes/purchaseRoutes.js
import express from 'express';
import {
  getPurchases,
  createPurchase,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  generateInvoice,
  generateBill,
  downloadInvoice,
  downloadBill,
  getPurchaseStats,
  approvePurchase,
  markDelivered,
  markInvoiced,
  markPaid,
  rejectPurchase,
  getDashboardStats
} from '../controllers/purchaseController.js';
import {
  uploadPurchaseFiles,
  uploadInvoice,
  handleFileUploadError
} from '../middleware/fileUpload.js';

const router = express.Router();

// Basic CRUD routes
router.get('/', getPurchases);
router.post('/', uploadPurchaseFiles, createPurchase, handleFileUploadError);
router.get('/stats', getPurchaseStats);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id', getPurchaseById);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

// Workflow automation routes
router.post('/:id/approve', approvePurchase);
router.post('/:id/deliver', markDelivered);
router.post('/:id/invoice', uploadInvoice, markInvoiced, handleFileUploadError);
router.post('/:id/pay', markPaid);
router.post('/:id/reject', rejectPurchase);

// PDF Generation routes
router.post('/:id/generate-invoice', generateInvoice);
router.post('/:id/generate-bill', generateBill);

// PDF Download routes
router.get('/:id/download-invoice', downloadInvoice);
router.get('/:id/download-bill', downloadBill);

export default router;
