import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getCustomers,
  createCustomer,
  createIndividualCustomer,
  createOrganizationalCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  sendOTP,
  verifyOTP,
  generateCustomerReceipt
} from '../controllers/customerController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/customers/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Customer routes
router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Individual Customer routes with file upload
router.post('/individual',
  upload.fields([
    { name: 'aadhaarPhoto', maxCount: 1 },
    { name: 'panPhoto', maxCount: 1 },
    { name: 'customerPhoto', maxCount: 1 }
  ]),
  createIndividualCustomer
);

// Organizational Customer routes with file upload
router.post('/organizational',
  upload.fields([
    { name: 'organizationPhoto', maxCount: 1 }
  ]),
  createOrganizationalCustomer
);

// Receipt generation
router.get('/:id/receipt', generateCustomerReceipt);

// OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

export default router;
