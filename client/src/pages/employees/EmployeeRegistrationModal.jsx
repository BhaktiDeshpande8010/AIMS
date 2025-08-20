import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { pincodeService } from '../../services/pincodeService';
import { toast } from 'react-toastify';

const EmployeeRegistrationModal = ({ isOpen, onClose, onSubmit, editMode = false, employeeData = null }) => {
  const [formData, setFormData] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (editMode && employeeData) {
      setFormData({
        employeeName: employeeData.employeeName || '',
        employeeId: employeeData.employeeId || '',
        department: employeeData.department || '',
        position: employeeData.position || '',
        email: employeeData.email || '',
        phoneNumber: employeeData.phoneNumber || '',
        address: employeeData.address || '',
        city: employeeData.city || '',
        state: employeeData.state || '',
        pincode: employeeData.pincode || '',
        joiningDate: employeeData.joiningDate ? employeeData.joiningDate.split('T')[0] : '',
        status: employeeData.status || 'Active',
        salary: employeeData.salary || '',
        // Banking Information
        bankName: employeeData.bankDetails?.bankName || '',
        accountNumber: employeeData.bankDetails?.accountNumber || '',
        ifscCode: employeeData.bankDetails?.ifscCode || '',
        accountHolderName: employeeData.bankDetails?.accountHolderName || ''
      });
    } else {
      setFormData({
        status: 'Active',
        joiningDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [editMode, employeeData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Structure the data properly for the backend
    const submitData = {
      employeeName: formData.employeeName,
      employeeId: formData.employeeId,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      department: formData.department,
      position: formData.position,
      salary: formData.salary,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      joiningDate: formData.joiningDate,
      status: formData.status,
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountHolderName: formData.accountHolderName
      }
    };

    // If there's a photo file, we need to use FormData for file upload
    if (formData.employeePhoto) {
      const formDataWithFile = new FormData();
      Object.keys(submitData).forEach(key => {
        if (key === 'bankDetails') {
          Object.keys(submitData.bankDetails).forEach(bankKey => {
            formDataWithFile.append(`bankDetails.${bankKey}`, submitData.bankDetails[bankKey]);
          });
        } else {
          formDataWithFile.append(key, submitData[key]);
        }
      });
      formDataWithFile.append('employeePhoto', formData.employeePhoto);
      onSubmit(formDataWithFile);
    } else {
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    }
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${editMode ? 'Edit' : 'Add'} Employee`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Name *
              </label>
              <input
                type="text"
                name="employeeName"
                required
                value={formData.employeeName || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter employee name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                required
                value={formData.employeeId || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter employee ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                required
                value={formData.department || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="RnD">RnD</option>
                <option value="Production">Production</option>
                <option value="Flight Lab">Flight Lab</option>
                <option value="Store">Store</option>
                <option value="QC">QC</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                type="text"
                name="position"
                required
                value={formData.position || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter position"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary *
              </label>
              <input
                type="number"
                name="salary"
                required
                value={formData.salary || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter monthly salary"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo
              </label>
              <input
                type="file"
                name="employeePhoto"
                accept="image/jpeg,image/png,image/jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500 mt-1">Upload employee photo (JPG, PNG)</p>
            </div>
          </div>
        </div>

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
                placeholder="employee@company.com"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                required
                value={formData.status || 'Active'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter full address"
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
          </div>
        </div>

        {/* Banking Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter account holder name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter bank name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter IFSC code"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
          >
            {editMode ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeRegistrationModal;
