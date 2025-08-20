// agri-drone-accounts/server/models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [100, 'Employee name cannot exceed 100 characters']
  },
  
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
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

  // Personal Information
  dateOfBirth: {
    type: Date
  },
  
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed']
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

  // Employment Information
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['RnD', 'Production', 'Flight Lab', 'Store', 'QC']
  },
  
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    default: Date.now
  },
  
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    default: 'Full-time'
  },
  
  workLocation: {
    type: String,
    enum: ['Office', 'Remote', 'Hybrid'],
    default: 'Office'
  },

  // Salary Information
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  
  payrollFrequency: {
    type: String,
    enum: ['Monthly', 'Bi-weekly', 'Weekly'],
    default: 'Monthly'
  },

  // Manager and Reporting
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  
  managerName: {
    type: String,
    trim: true
  },

  // Skills and Qualifications
  skills: [{
    type: String,
    trim: true
  }],
  
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date
  }],

  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    }
  },

  // Bank Details
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },

  // Government IDs
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  
  aadharNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number']
  },

  // Status and Flags
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  probationPeriod: {
    type: Number, // in months
    default: 6
  },
  
  isProbationCompleted: {
    type: Boolean,
    default: false
  },

  // Performance and Attendance
  performanceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  totalLeavesTaken: {
    type: Number,
    default: 0
  },
  
  leaveBalance: {
    type: Number,
    default: 24 // Annual leave days
  },

  // Additional Information
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  profilePicture: {
    type: String // URL to profile picture
  },

  // Approval System
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

  // Audit Information
  createdBy: {
    type: String,
    default: 'System'
  },

  updatedBy: {
    type: String,
    default: 'System'
  },
  
  terminationDate: {
    type: Date
  },
  
  terminationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ joiningDate: -1 });
employeeSchema.index({ managerId: 1 });

// Virtual for full name display
employeeSchema.virtual('displayName').get(function() {
  return this.employeeName;
});

// Virtual for full address
employeeSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}`;
});

// Virtual for tenure (in months)
employeeSchema.virtual('tenure').get(function() {
  const today = new Date();
  const joining = new Date(this.joiningDate);
  const diffTime = today - joining;
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths;
});

// Virtual for age
employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
});

// Static method to get employees by department
employeeSchema.statics.getEmployeesByDepartment = function(department) {
  return this.find({ department, status: 'Active' })
    .sort({ employeeName: 1 });
};

// Static method to get employees by manager
employeeSchema.statics.getEmployeesByManager = function(managerId) {
  return this.find({ managerId, status: 'Active' })
    .sort({ employeeName: 1 });
};

// Instance method to update leave balance
employeeSchema.methods.updateLeaveBalance = function(days, operation = 'deduct') {
  if (operation === 'deduct') {
    this.leaveBalance = Math.max(0, this.leaveBalance - days);
    this.totalLeavesTaken += days;
  } else if (operation === 'add') {
    this.leaveBalance += days;
  }
  return this.save();
};

// Instance method to complete probation
employeeSchema.methods.completeProbation = function() {
  this.isProbationCompleted = true;
  return this.save();
};

// Pre-save middleware
employeeSchema.pre('save', function(next) {
  // Auto-complete probation if tenure is greater than probation period
  if (this.tenure >= this.probationPeriod && !this.isProbationCompleted) {
    this.isProbationCompleted = true;
  }
  
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
