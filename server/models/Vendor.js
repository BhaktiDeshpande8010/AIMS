// agri-drone-accounts/server/models/Vendor.js
import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  // Basic Information
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  
  legalStructure: {
    type: String,
    required: [true, 'Legal structure is required'],
    enum: ['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd', 'LLP', 'Others']
  },
  
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['Manufacturer', 'Trader', 'Service Provider']
  },
  
  vendorType: {
    type: String,
    required: [true, 'Vendor type is required'],
    enum: ['Local', 'National', 'International']
  },

  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },

  // Address Information
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
  },
  
  country: {
    type: String,
    default: 'India',
    trim: true
  },

  // Legal & Tax Information
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  
  dateOfIncorporation: {
    type: Date
  },
  
  websiteLink: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },

  // Banking Information
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
    maxlength: [100, 'Bank name cannot exceed 100 characters']
  },
  
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters']
  },
  
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
  },
  
  swiftCode: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Please enter a valid SWIFT/BIC code']
  },
  
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  
  accountHolderName: {
    type: String,
    required: [true, 'Account holder name is required'],
    trim: true,
    maxlength: [100, 'Account holder name cannot exceed 100 characters']
  },
  
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    default: 'INR'
  },

  // Undertaking Information
  undertakingName: {
    type: String,
    required: [true, 'Undertaking person name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  undertakingEmail: {
    type: String,
    required: [true, 'Undertaking email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  signature: {
    type: String, // File path or base64 string
    default: null
  },

  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending', 'Suspended'],
    default: 'Pending'
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDate: {
    type: Date
  },
  
  lastOrderDate: {
    type: Date
  },
  
  totalOrders: {
    type: Number,
    default: 0
  },
  
  totalOrderValue: {
    type: Number,
    default: 0
  },

  // Audit fields
  createdBy: {
    type: String,
    default: 'System'
  },
  
  updatedBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ vendorType: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ gstNumber: 1 });
vendorSchema.index({ panNumber: 1 });
vendorSchema.index({ createdAt: -1 });

// Virtual for formatted creation date
vendorSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toISOString().split('T')[0] : null;
});

// Pre-save middleware for validation based on vendor type
vendorSchema.pre('save', function(next) {
  // Validation for National vendors
  if (this.vendorType === 'National') {
    if (!this.gstNumber) {
      return next(new Error('GST number is required for National vendors'));
    }
    if (!this.websiteLink) {
      return next(new Error('Website link is required for National vendors'));
    }
    if (!this.dateOfIncorporation) {
      return next(new Error('Date of incorporation is required for National vendors'));
    }
  }
  
  // Validation for International vendors
  if (this.vendorType === 'International') {
    if (!this.swiftCode) {
      return next(new Error('SWIFT/BIC code is required for International vendors'));
    }
    if (this.currency === 'INR') {
      return next(new Error('International vendors cannot use INR currency'));
    }
  } else {
    // Local and National vendors must use IFSC code
    if (!this.ifscCode) {
      return next(new Error('IFSC code is required for Local and National vendors'));
    }
  }
  
  // Set verification status
  if (this.isVerified && !this.verificationDate) {
    this.verificationDate = new Date();
  }
  
  next();
});

// Static method to get vendors by type
vendorSchema.statics.getByType = function(type) {
  return this.find({ vendorType: type, status: { $ne: 'Inactive' } });
};

// Instance method to activate vendor
vendorSchema.methods.activate = function() {
  this.status = 'Active';
  this.isVerified = true;
  this.verificationDate = new Date();
  return this.save();
};

// Instance method to deactivate vendor
vendorSchema.methods.deactivate = function() {
  this.status = 'Inactive';
  return this.save();
};

// Instance method to get recent orders
vendorSchema.methods.getRecentOrders = async function(limit = 5) {
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  return await PurchaseOrder.getRecentOrdersForVendor(this._id, limit);
};

// Instance method to get supplied products
vendorSchema.methods.getSuppliedProducts = async function() {
  const Product = mongoose.model('Product');
  return await Product.getProductsByVendor(this._id);
};

// Instance method to get vendor statistics
vendorSchema.methods.getStatistics = async function() {
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const stats = await PurchaseOrder.getVendorStats(this._id);
  return stats[0] || {
    totalOrders: 0,
    totalValue: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    lastOrderDate: null
  };
};

// Instance method to update order statistics
vendorSchema.methods.updateOrderStats = function(orderValue, orderDate = new Date()) {
  this.totalOrders += 1;
  this.totalOrderValue += orderValue;
  this.lastOrderDate = orderDate;
  return this.save();
};

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
