// agri-drone-accounts/server/models/Customer.js
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  // Basic Information
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [200, 'Customer name cannot exceed 200 characters']
  },
  
  customerType: {
    type: String,
    required: [true, 'Customer type is required'],
    enum: ['Individual', 'Business', 'Corporate'],
    default: 'Individual'
  },

  // Individual Customer Specific Fields
  aadhaarNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhaar number'],
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  aadhaarPhoto: {
    type: String, // File path/URL
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  customerPhoto: {
    type: String, // File path/URL for profile photo
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  detailedAddress: {
    type: String,
    trim: true,
    maxlength: [1000, 'Detailed address cannot exceed 1000 characters'],
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  alternatePhone: {
    type: String,
    trim: true,
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
    trim: true
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

  // Business Information (for Business/Corporate customers)
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'],
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  panPhoto: {
    type: String, // File path/URL
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  // Product & Pricing Information
  selectedProduct: {
    type: String,
    enum: ['Arjuna', 'Arjuna ADV'],
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  basePrice: {
    type: Number,
    min: [0, 'Base price cannot be negative'],
    required: function() {
      return this.customerType === 'Individual';
    }
  },

  gstAmount: {
    type: Number,
    min: [0, 'GST amount cannot be negative'],
    default: 0
  },

  gstPercentage: {
    type: Number,
    min: [0, 'GST percentage cannot be negative'],
    max: [100, 'GST percentage cannot exceed 100'],
    default: 18 // Default GST rate
  },

  finalPrice: {
    type: Number,
    min: [0, 'Final price cannot be negative'],
    default: 0
  },

  // Bank Details
  bankDetails: {
    bankName: {
      type: String,
      trim: true,
      required: function() {
        return this.customerType === 'Individual';
      }
    },
    accountNumber: {
      type: String,
      trim: true,
      required: function() {
        return this.customerType === 'Individual';
      }
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'],
      required: function() {
        return this.customerType === 'Individual';
      }
    }
  },
  
  industry: {
    type: String,
    enum: ['Agriculture', 'Technology', 'Manufacturing', 'Retail', 'Services', 'Others'],
    trim: true
  },
  
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    trim: true
  },

  // Financial Information
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  
  outstandingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Outstanding amount cannot be negative']
  },
  
  totalPurchases: {
    type: Number,
    default: 0,
    min: [0, 'Total purchases cannot be negative']
  },
  
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },

  // Customer Preferences
  preferredPaymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'Cheque'],
    default: 'Bank Transfer'
  },
  
  paymentTerms: {
    type: String,
    enum: ['Immediate', 'Net 15', 'Net 30', 'Net 45', 'Net 60'],
    default: 'Net 30'
  },

  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approverName: {
    type: String,
    trim: true
  },

  approvedAt: {
    type: Date
  },

  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  rejectedAt: {
    type: Date
  },

  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Admin approval required flag
  requiresApproval: {
    type: Boolean,
    default: true
  },

  // Status and Flags
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Registered', 'Active', 'Inactive', 'Suspended', 'Blacklisted'],
    default: 'Draft'
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isVIP: {
    type: Boolean,
    default: false
  },

  // Customer Statistics
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  
  lastOrderDate: {
    type: Date
  },
  
  averageOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Average order value cannot be negative']
  },

  // Additional Information
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  tags: [{
    type: String,
    trim: true
  }],

  // Audit Information
  createdBy: {
    type: String,
    default: 'System'
  },
  
  updatedBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to calculate GST and final price
customerSchema.pre('save', function(next) {
  // Calculate GST and final price for Individual customers
  if (this.customerType === 'Individual' && this.basePrice) {
    this.gstAmount = (this.basePrice * this.gstPercentage) / 100;
    this.finalPrice = this.basePrice + this.gstAmount;
  }

  // Update status based on approval
  if (this.approvalStatus === 'Approved' && this.status === 'Draft') {
    this.status = 'Registered';
  }

  next();
});

// Indexes for better performance
customerSchema.index({ email: 1 });
customerSchema.index({ phoneNumber: 1 });
customerSchema.index({ customerType: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ approvalStatus: 1 });
customerSchema.index({ city: 1, state: 1 });
customerSchema.index({ lastOrderDate: -1 });

// Virtual for full name display
customerSchema.virtual('displayName').get(function() {
  return this.customerName;
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}`;
});

// Virtual for customer age (days since registration)
customerSchema.virtual('customerAge').get(function() {
  const today = new Date();
  const createdDate = new Date(this.createdAt);
  const diffTime = today - createdDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for credit utilization
customerSchema.virtual('creditUtilization').get(function() {
  if (this.creditLimit === 0) return 0;
  return ((this.outstandingAmount / this.creditLimit) * 100).toFixed(2);
});

// Static method to get customers by type
customerSchema.statics.getCustomersByType = function(type) {
  return this.find({ customerType: type, status: 'Active' })
    .sort({ customerName: 1 });
};

// Static method to get VIP customers
customerSchema.statics.getVIPCustomers = function() {
  return this.find({ isVIP: true, status: 'Active' })
    .sort({ totalPurchases: -1 });
};

// Instance method to update order statistics
customerSchema.methods.updateOrderStats = function(orderValue, orderDate = new Date()) {
  this.totalOrders += 1;
  this.totalPurchases += orderValue;
  this.lastOrderDate = orderDate;
  this.averageOrderValue = this.totalPurchases / this.totalOrders;
  return this.save();
};

// Instance method to add outstanding amount
customerSchema.methods.addOutstanding = function(amount) {
  this.outstandingAmount += amount;
  return this.save();
};

// Instance method to clear outstanding amount
customerSchema.methods.clearOutstanding = function(amount) {
  this.outstandingAmount = Math.max(0, this.outstandingAmount - amount);
  return this.save();
};

// Pre-save middleware
customerSchema.pre('save', function(next) {
  // Auto-set VIP status based on total purchases
  if (this.totalPurchases >= 500000) { // 5 Lakh INR
    this.isVIP = true;
  }
  
  // Validate GST and PAN for business customers
  if (this.customerType !== 'Individual') {
    if (!this.gstNumber && !this.panNumber) {
      return next(new Error('GST or PAN number is required for business customers'));
    }
  }
  
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
