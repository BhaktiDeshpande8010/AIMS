import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration for quotations
const quotationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'quotations');
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `quotation-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Storage configuration for invoices
const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'invoices');
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `invoice-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG files are allowed.'), false);
  }
};

// File size limits (5MB)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

// Multer configurations
export const uploadQuotation = multer({
  storage: quotationStorage,
  fileFilter,
  limits
}).single('quotationFile');

export const uploadInvoice = multer({
  storage: invoiceStorage,
  fileFilter,
  limits
}).single('invoiceFile');

// Multiple file upload for purchase orders
export const uploadPurchaseFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      if (file.fieldname === 'quotationFile') {
        uploadPath = path.join(process.cwd(), 'uploads', 'quotations');
      } else if (file.fieldname === 'invoiceFile') {
        uploadPath = path.join(process.cwd(), 'uploads', 'invoices');
      } else {
        uploadPath = path.join(process.cwd(), 'uploads', 'documents');
      }
      createUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const prefix = file.fieldname === 'quotationFile' ? 'quotation' : 
                    file.fieldname === 'invoiceFile' ? 'invoice' : 'document';
      const filename = `${prefix}-${uniqueSuffix}${extension}`;
      cb(null, filename);
    }
  }),
  fileFilter,
  limits
}).fields([
  { name: 'quotationFile', maxCount: 1 },
  { name: 'invoiceFile', maxCount: 1 }
]);

// Error handling middleware for file uploads
export const handleFileUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check the file field name.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'File upload error occurred.'
  });
};

// Utility function to delete uploaded files
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file info
export const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date()
  };
};
