import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  // Role and Permissions
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'accounts'],
      message: 'Role must be either admin or accounts'
    },
    default: 'accounts'
  },
  
  permissions: {
    // CRUD Permissions
    canCreate: {
      type: Boolean,
      default: true
    },
    canRead: {
      type: Boolean,
      default: true
    },
    canUpdate: {
      type: Boolean,
      default: true
    },
    canDelete: {
      type: Boolean,
      default: false // Only admins get delete permissions
    },
    
    // Approval Permissions
    canApprove: {
      type: Boolean,
      default: false // Only admins can approve
    },
    
    // Module Access
    canAccessAdmin: {
      type: Boolean,
      default: false // Only admins can access admin portal
    },
    canAccessAccounts: {
      type: Boolean,
      default: true // Both roles can access accounts features
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Login Information
  lastLogin: {
    type: Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date
  },
  
  // Profile Information
  profilePicture: {
    type: String
  },
  
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  designation: {
    type: String,
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  
  // Timestamps
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

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    if (this.role === 'admin') {
      this.permissions = {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canApprove: true,
        canAccessAdmin: true,
        canAccessAccounts: true
      };
    } else if (this.role === 'accounts') {
      this.permissions = {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canApprove: false,
        canAccessAdmin: false,
        canAccessAccounts: true
      };
    }
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to get user with role permissions
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ 
    email: email.toLowerCase(),
    isActive: true 
  });
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid login credentials');
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  return user;
};

// Static method to create default users
userSchema.statics.createDefaultUsers = async function() {
  // Create default admin user
  const adminExists = await this.findOne({ role: 'admin' });

  if (!adminExists) {
    const defaultAdmin = new this({
      username: 'admin',
      email: 'admin@agridrone.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isEmailVerified: true,
      department: 'Administration',
      designation: 'System Administrator',
      createdBy: 'System'
    });

    await defaultAdmin.save();
    console.log('Default admin user created successfully');
  }

  // Create default accounts user
  const accountsExists = await this.findOne({ role: 'accounts' });

  if (!accountsExists) {
    const defaultAccounts = new this({
      username: 'accounts',
      email: 'accounts@agridrone.com',
      password: 'accounts123',
      firstName: 'Finance',
      lastName: 'Manager',
      role: 'accounts',
      isEmailVerified: true,
      department: 'Finance',
      designation: 'Accounts Manager',
      createdBy: 'System'
    });

    await defaultAccounts.save();
    console.log('Default accounts user created successfully');
  }

  return { admin: adminExists, accounts: accountsExists };
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

export default User;
