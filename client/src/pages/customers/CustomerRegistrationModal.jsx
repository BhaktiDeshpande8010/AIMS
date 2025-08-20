import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { pincodeService } from '../../services/pincodeService';

const CustomerRegistrationModal = ({ isOpen, onClose, type, onSubmit, editMode = false, customerData = null }) => {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [customerType, setCustomerType] = useState('Individual');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (editMode && customerData) {
      setFormData({
        customerName: customerData.customerName || '',
        email: customerData.email || '',
        phoneNumber: customerData.phoneNumber || '',
        address: customerData.address || '',
        customerType: customerData.customerType || 'Individual',
        // Individual fields
        aadhaarNumber: customerData.aadhaarNumber || '',
        panNumber: customerData.panNumber || '',
        // Organizational fields
        businessDetails: customerData.businessDetails || '',
        companyRegistrationNumber: customerData.companyRegistrationNumber || '',
        gstNumber: customerData.gstNumber || '',
      });
      setCustomerType(customerData.customerType || 'Individual');
    } else {
      setFormData({
        customerType: 'Individual'
      });
      setCustomerType('Individual');
    }
    setCurrentStep(1);
    setOtpSent(false);
    setOtpVerified(false);
  }, [editMode, customerData, type, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!otpVerified) {
        toast.error('Please verify OTP first');
        return;
      }
      onSubmit({ ...formData, customerType: type });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData({
      ...formData,
      pincode
    });

    // Auto-fill city and state when pincode is 6 digits
    if (pincode.length === 6 && pincodeService.validatePincode(pincode)) {
      try {
        const response = await pincodeService.getLocationByPincode(pincode);
        if (response.success) {
          setFormData(prev => ({
            ...prev,
            pincode,
            city: response.data.city,
            state: response.data.state
          }));
          toast.success(`Location auto-filled: ${response.data.city}, ${response.data.state}`);
        } else {
          toast.info(response.message);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      toast.error('Invalid phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5004/api/customers/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          purpose: 'customer_registration'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        toast.success('OTP sent!');
      } else {
        toast.error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Invalid OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5004/api/customers/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          otp: formData.otp,
          purpose: 'customer_registration'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpVerified(true);
        toast.success('OTP verified!');
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
            currentStep >= step 
              ? 'bg-gray-900 text-white border-gray-900' 
              : 'bg-white text-gray-400 border-gray-300'
          }`}>
            {currentStep > step ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < 2 && (
            <div className={`w-16 h-0.5 mx-3 transition-all duration-300 ${
              currentStep > step ? 'bg-gray-900' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = {
      1: 'Customer Details',
      2: 'Contact & Address Information',
      3: 'OTP Verification'
    };
    const descriptions = {
      1: 'Basic information about the customer',
      2: 'Contact details and address',
      3: 'Verify phone number with OTP'
    };
    return (
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {titles[currentStep]}
        </h3>
        <p className="text-gray-600 text-sm">
          {descriptions[currentStep]}
        </p>
      </div>
    );
  };

  const renderCustomerDetails = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              name="customerName"
              required
              value={formData.customerName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Type *
            </label>
            <input
              type="text"
              value={type}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              pattern="[0-9]{10}"
              maxLength="10"
              value={formData.phoneNumber || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="10-digit phone number"
            />
          </div>
        </div>
      </div>

      {/* Conditional Fields Based on Customer Type */}
      {type === 'Individual' ? (
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Details</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                required
                pattern="[0-9]{12}"
                maxLength="12"
                value={formData.aadhaarNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="12-digit Aadhaar number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                name="panNumber"
                required
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength="10"
                value={formData.panNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="ABCDE1234F"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Address *
              </label>
              <textarea
                name="address"
                required
                rows="3"
                value={formData.address || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                onChange={handleChange}
                placeholder="Enter complete address with landmarks"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Customer Photo
              </label>
              <input
                type="file"
                name="customerPhoto"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Upload a clear photo of the customer (JPG, PNG)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Organizational Details</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entire Business Details *
              </label>
              <textarea
                name="businessDetails"
                required
                rows="4"
                value={formData.businessDetails || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                onChange={handleChange}
                placeholder="Describe the business, services, products, and operations in detail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Registration Number *
              </label>
              <input
                type="text"
                name="companyRegistrationNumber"
                required
                value={formData.companyRegistrationNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Company registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number *
              </label>
              <input
                type="text"
                name="gstNumber"
                required
                pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                maxLength="15"
                value={formData.gstNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                name="panNumber"
                required
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength="10"
                value={formData.panNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="ABCDE1234F"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );

  const renderContactAddress = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="customer@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              pattern="[0-9]{10}"
              maxLength="10"
              value={formData.phoneNumber || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="10-digit phone number"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              required
              rows="3"
              value={formData.address || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              onChange={handleChange}
              placeholder="Enter complete address"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                required
                value={formData.state || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                required
                pattern="[0-9]{6}"
                maxLength="6"
                value={formData.pincode || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handlePincodeChange}
                placeholder="6-digit pincode (auto-fills city & state)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOTPVerification = () => (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Phone Number Verification</h4>
        <div className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              We will send an OTP to <strong>{formData.phoneNumber}</strong> for verification
            </p>
          </div>

          {!otpSent ? (
            <div>
              <Button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || !formData.phoneNumber}
                className="w-full max-w-xs mx-auto"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  name="otp"
                  required
                  pattern="[0-9]{6}"
                  maxLength="6"
                  value={formData.otp || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-center text-lg tracking-widest"
                  onChange={handleChange}
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit OTP sent to your phone</p>
              </div>

              {!otpVerified ? (
                <div className="flex space-x-3 justify-center">
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading || !formData.otp}
                    className="px-6"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="px-6"
                  >
                    Resend OTP
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Phone number verified successfully!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderCustomerDetails();
      case 2:
        return renderContactAddress();
      case 3:
        return renderOTPVerification();
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${editMode ? 'Edit' : 'Add'} ${type} Customer`}
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepIndicator()}
          {renderStepTitle()}
          
          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 mt-8">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Step {currentStep} of 3
                </span>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    onClick={onClose}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 flex items-center space-x-2"
                  >
                    <span>{currentStep < 3 ? 'Next' : (editMode ? 'Update Customer' : 'Add Customer')}</span>
                    {currentStep < 3 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CustomerRegistrationModal;
