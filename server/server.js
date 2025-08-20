// server/server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import database connection
import connectDB from './config/database.js';
import User from './models/User.js';

// Import routes
import vendorRoutes from './routes/vendorRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and create default users - REQUIRED for real database persistence
connectDB().then(async () => {
  try {
    // Create default admin and accounts users if they don't exist
    await User.createDefaultUsers();
  } catch (error) {
    console.error('Error creating default users:', error);
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure multer for file uploads (mock)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/files', fileRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// File upload endpoint (mock)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  // Mock file upload response
  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.originalname}`
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Agri-Drone Accounts API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Agri-Drone Accounts Server running on port ${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
});
