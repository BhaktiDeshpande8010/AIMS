import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import StyledSelect from '../../components/StyledSelect';
import { vendorService } from '../../services/vendorService';
import { pincodeService } from '../../services/pincodeService';

const VendorRegistrationModal = ({ isOpen, onClose, type, onSubmit, editMode = false, vendorData = null }) => {
  const [formData, setFormData] = useState({
    currency: type === 'International' ? '' : 'INR',
    websiteLink: '',
    panNumber: '',
    dateOfIncorporation: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(editMode); // Skip OTP for edit mode
  const [loading, setLoading] = useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

  // Initialize form data when editing
  useEffect(() => {
    if (editMode && vendorData) {
      setFormData({
        vendorName: vendorData.vendorName || '',
        email: vendorData.email || '',
        phoneNumber: vendorData.phoneNumber || '',
        address: vendorData.address || '',
        currency: vendorData.currency || (type === 'International' ? '' : 'INR'),
        gstNumber: vendorData.gstNumber || '',
        panNumber: vendorData.panNumber || '',
        websiteLink: vendorData.websiteLink || '',
        dateOfIncorporation: vendorData.dateOfIncorporation || '',
        // Add other fields as needed
      });
      setOtpVerified(true); // Skip OTP verification for edit mode
    } else {
      setFormData({
        currency: type === 'International' ? '' : 'INR',
        websiteLink: '',
        panNumber: '',
        dateOfIncorporation: ''
      });
      setOtpVerified(false);
    }
    setCurrentStep(1);
    setOtpSent(false);
  }, [editMode, vendorData, type, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3 && !otpSent && !editMode) {
      handleSendOTP();
    } else if (otpVerified || editMode) {
      onSubmit({ ...formData, type });
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
    try {
      setLoading(true);
      
      if (!formData.undertakingEmail) {
        toast.error('Email required');
        return;
      }

      const response = await vendorService.sendOTP(
        formData.undertakingEmail, 
        editMode ? 'vendor_update' : 'vendor_registration'
      );
      
      if (response.success) {
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
    try {
      if (!formData.otp || formData.otp.length !== 6) {
        toast.error('Invalid OTP');
        return;
      }

      const response = await vendorService.verifyOTP(
        formData.undertakingEmail,
        formData.otp,
        editMode ? 'vendor_update' : 'vendor_registration'
      );
      
      if (response.success) {
        setOtpVerified(true);
        toast.success('OTP verified!');
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Verification failed');
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
          {step < 3 && (
            <div className={`w-16 h-0.5 mx-3 transition-all duration-300 ${
              currentStep > step ? 'bg-gray-900' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = editMode ? {
      1: 'Basic Information',
      2: 'Address & Location',
      3: 'Financial Details'
    } : {
      1: 'Vendor Details',
      2: 'Banking Information',
      3: 'Undertaking & Verification'
    };

    const descriptions = editMode ? {
      1: 'Update vendor basic information',
      2: 'Update address and location details',
      3: 'Update banking and financial information'
    } : {
      1: 'Basic information about the vendor',
      2: 'Banking and payment details',
      3: 'Final verification and submission'
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

  const renderVendorDetails = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Name *
            </label>
            <input
              type="text"
              name="vendorName"
              required
              value={formData.vendorName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Structure *
            </label>
            <StyledSelect
              value={formData.legalStructure ? { value: formData.legalStructure, label: formData.legalStructure } : null}
              onChange={(selectedOption) => {
                handleChange({
                  target: {
                    name: 'legalStructure',
                    value: selectedOption?.value || ''
                  }
                });
              }}
              options={['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd', 'LLP', 'Others'].map(option => ({
                value: option,
                label: option
              }))}
              placeholder="Select Legal Structure"
              isSearchable={false}
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
              Contact Number *
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

          {/* GST Registration No. for Local and National vendors */}
          {(type === 'Local' || type === 'National') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Registration No. (Optional)
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                title="Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
              />
              <p className="text-xs text-gray-500 mt-1">15-digit GST identification number</p>
            </div>
          )}

          {/* PAN Number for National vendors */}
          {type === 'National' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                name="panNumber"
                required
                value={formData.panNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="ABCDE1234F"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                maxLength="10"
              />
              <p className="text-xs text-gray-500 mt-1">10-character PAN number</p>
            </div>
          )}

          {/* Website Link for National and International vendors */}
          {(type === 'National' || type === 'International') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website Link {type === 'National' ? '*' : '(Optional)'}
              </label>
              <input
                type="url"
                name="websiteLink"
                required={type === 'National'}
                value={formData.websiteLink || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="https://www.example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Company website URL</p>
            </div>
          )}

          {/* Date of Incorporation for National vendors */}
          {type === 'National' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Incorporation *
              </label>
              <input
                type="date"
                name="dateOfIncorporation"
                required
                value={formData.dateOfIncorporation || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Company incorporation date</p>
            </div>
          )}
        </div>
      </div>

      {/* Business Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Business *
            </label>
            <select
              name="businessType"
              required
              value={formData.businessType || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="">Select Business Type</option>
              {['Manufacturer', 'Trader', 'Service Provider'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

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

          <div className="lg:col-span-2">
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
              placeholder="Enter complete business address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              name="state"
              required
              value={formData.state || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter state"
            />
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
  );

  const renderBankingInfo = () => (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              type="text"
              name="bankName"
              required
              value={formData.bankName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name *
            </label>
            <input
              type="text"
              name="branchName"
              required
              value={formData.branchName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter branch name"
            />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'International' ? 'SWIFT/BIC Code *' : 'IFSC Code *'}
            </label>
            <input
              type="text"
              name={type === 'International' ? 'swiftCode' : 'ifscCode'}
              required
              maxLength="11"
              value={formData[type === 'International' ? 'swiftCode' : 'ifscCode'] || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder={type === 'International' ? 'SWIFT/BIC Code' : 'IFSC Code (11 chars)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              type="text"
              name="accountNumber"
              required
              value={formData.accountNumber || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name *
            </label>
            <input
              type="text"
              name="accountHolderName"
              required
              value={formData.accountHolderName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter account holder name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            {type === 'International' ? (
              <select
                name="currency"
                required
                value={formData.currency || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value="INR (Indian Rupee)"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUndertakingOTP = () => (
    <div className="space-y-6">
      {/* Undertaking Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Undertaking Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorized Person Name *
            </label>
            <input
              type="text"
              name="undertakingName"
              required
              value={formData.undertakingName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter authorized person name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="undertakingEmail"
              required
              value={formData.undertakingEmail || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="OTP will be sent to this email"
            />
            <p className="text-xs text-gray-500 mt-1">OTP will be sent to this email address</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digital Signature (Optional)
          </label>
          <input
            type="file"
            name="signature"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            onChange={(e) => {
              setFormData({
                ...formData,
                signature: e.target.files[0]
              });
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Upload signature image (JPG, PNG, max 2MB)</p>
        </div>
      </div>

      {/* OTP Verification */}
      {!editMode && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">OTP Verification</h4>

          {!otpSent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-2">Ready for OTP Verification</h5>
              <p className="text-gray-600 mb-4">Click "Get OTP" to send verification code to your email</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">OTP sent successfully!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">Please check your email for the 6-digit verification code.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP *
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength="6"
                    pattern="[0-9]{6}"
                    value={formData.otp || ''}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                    onChange={handleChange}
                    placeholder="000000"
                  />
                  <Button
                    type="button"
                    variant={otpVerified ? "success" : "outline"}
                    onClick={handleVerifyOTP}
                    disabled={!formData.otp || formData.otp.length !== 6 || otpVerified}
                    className="px-6"
                  >
                    {otpVerified ? 'Verified' : 'Verify'}
                  </Button>
                </div>
                {otpVerified && (
                  <div className="flex items-center text-green-600 text-sm mt-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    OTP verified successfully! You can now submit the form.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Edit mode render functions - only show editable sections
  const renderEditBasicInfo = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Name *
            </label>
            <input
              type="text"
              name="vendorName"
              required
              value={formData.vendorName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Structure *
            </label>
            <select
              name="legalStructure"
              required
              value={formData.legalStructure || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="">Select Legal Structure</option>
              {['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd', 'LLP', 'Others'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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
              Contact Number *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Business *
            </label>
            <select
              name="businessType"
              required
              value={formData.businessType || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="">Select Business Type</option>
              {['Manufacturer', 'Trader', 'Service Provider'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* GST Registration No. for Local and National vendors */}
          {(type === 'Local' || type === 'National') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Registration No. (Optional)
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                title="Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
              />
              <p className="text-xs text-gray-500 mt-1">15-digit GST identification number</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditAddressInfo = () => (
    <div className="space-y-6">
      {/* Address Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Address & Location</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
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
              placeholder="Enter complete business address"
            />
          </div>

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
            <input
              type="text"
              name="state"
              required
              value={formData.state || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter state"
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              required
              value={formData.country || (type === 'International' ? '' : 'India')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Enter country"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (editMode) {
      switch (currentStep) {
        case 1:
          return renderEditBasicInfo();
        case 2:
          return renderEditAddressInfo();
        case 3:
          return renderBankingInfo();
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 1:
          return renderVendorDetails();
        case 2:
          return renderBankingInfo();
        case 3:
          return renderUndertakingOTP();
        default:
          return null;
      }
    }
  };

  const getButtonText = () => {
    if (currentStep < 3) return 'Next';
    if (editMode) return 'Update Vendor';
    if (currentStep === 3 && !otpSent) return loading ? 'Sending OTP...' : 'Get OTP';
    if (currentStep === 3 && otpSent && !otpVerified) return 'Verify OTP First';
    return 'Submit';
  };

  const isButtonDisabled = () => {
    if (loading) return true;
    if (currentStep === 3 && otpSent && !otpVerified && !editMode) return true;
    return false;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${editMode ? 'Edit' : 'Add'} ${type} Vendor`}
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
                    disabled={isButtonDisabled()}
                    className={`px-8 flex items-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{getButtonText()}</span>
                    {currentStep < 3 && !loading && (
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

export default VendorRegistrationModal;
