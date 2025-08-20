import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    required: function() {
      return this.purpose && this.purpose.includes('vendor');
    }
  },

  phoneNumber: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    required: function() {
      return this.purpose && this.purpose.includes('customer');
    }
  },

  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6
  },

  purpose: {
    type: String,
    required: [true, 'OTP purpose is required'],
    enum: ['vendor_registration', 'vendor_update', 'customer_registration', 'customer_update', 'password_reset', 'email_verification'],
    default: 'vendor_registration'
  },
  
  isUsed: {
    type: Boolean,
    default: false
  },
  
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  }
}, {
  timestamps: true
});

// Index for automatic deletion of expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ phoneNumber: 1, purpose: 1 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create new OTP
otpSchema.statics.createOTP = async function(email, purpose = 'vendor_registration') {
  // Delete any existing OTPs for this email and purpose
  await this.deleteMany({ email, purpose });
  
  const otp = this.generateOTP();
  
  const newOTP = new this({
    email,
    otp,
    purpose
  });
  
  await newOTP.save();
  return otp;
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, purpose = 'vendor_registration') {
  const otpDoc = await this.findOne({
    email,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    throw new Error('Invalid or expired OTP');
  }
  
  // Increment attempts
  otpDoc.attempts += 1;
  
  if (otpDoc.attempts > 3) {
    await otpDoc.deleteOne();
    throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
  }
  
  if (otpDoc.otp !== otp) {
    await otpDoc.save();
    throw new Error('Invalid OTP');
  }
  
  // Mark as used
  otpDoc.isUsed = true;
  await otpDoc.save();
  
  return true;
};

// Instance method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
