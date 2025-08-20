import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Upload, X, CheckCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import StyledSelect from '../../components/StyledSelect';
import { pincodeService } from '../../services/pincodeService';

const EnhancedPurchaseOrderModal = ({ isOpen, onClose, onSubmit, editMode = false, purchaseData = null }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    poNumber: '',
    vendorName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    
    // New Enhanced Fields
    buyerName: '',
    department: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    paymentTerms: 'Net 30',
    
    // Financial Information
    shippingCharges: 0,
    otherCharges: 0,
    discountAmount: 0,
    gstRate: 18,
    
    // Files
    quotationFile: null,
    invoiceFile: null,
    
    // Additional Information
    notes: '',
    status: 'Draft'
  });

  const [items, setItems] = useState([{
    id: 1,
    productName: '',
    description: '',
    quantity: 1,
    unitOfMeasure: 'pcs',
    unitPrice: 0,
    hsnCode: '',
    taxRate: 18,
    taxAmount: 0,
    totalPrice: 0
  }]);

  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // Unit of Measure options
  const uomOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'grams', label: 'Grams' },
    { value: 'meters', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' },
    { value: 'mm', label: 'Millimeters' },
    { value: 'liters', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'sets', label: 'Sets' },
    { value: 'pairs', label: 'Pairs' },
    { value: 'dozens', label: 'Dozens' },
    { value: 'units', label: 'Units' }
  ];

  // Payment Terms options
  const paymentTermsOptions = [
    { value: 'Net 15', label: 'Net 15 Days' },
    { value: 'Net 30', label: 'Net 30 Days' },
    { value: 'Net 45', label: 'Net 45 Days' },
    { value: 'Net 60', label: 'Net 60 Days' },
    { value: 'COD', label: 'Cash on Delivery' },
    { value: 'Advance 25%', label: 'Advance 25%' },
    { value: 'Advance 50%', label: 'Advance 50%' },
    { value: 'Advance 75%', label: 'Advance 75%' },
    { value: 'Advance 100%', label: 'Advance 100%' }
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (editMode && purchaseData) {
      setFormData({
        poNumber: purchaseData.poNumber || '',
        vendorName: purchaseData.vendorName || '',
        orderDate: purchaseData.orderDate ? purchaseData.orderDate.split('T')[0] : '',
        expectedDeliveryDate: purchaseData.expectedDeliveryDate ? purchaseData.expectedDeliveryDate.split('T')[0] : '',
        buyerName: purchaseData.buyerName || '',
        department: purchaseData.department || '',
        deliveryAddress: purchaseData.deliveryAddress || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        paymentTerms: purchaseData.paymentTerms || 'Net 30',
        shippingCharges: purchaseData.shippingCharges || 0,
        otherCharges: purchaseData.otherCharges || 0,
        discountAmount: purchaseData.discountAmount || 0,
        gstRate: purchaseData.gstRate || 18,
        notes: purchaseData.notes || '',
        status: purchaseData.status || 'Draft'
      });

      if (purchaseData.items && purchaseData.items.length > 0) {
        setItems(purchaseData.items.map((item, index) => ({
          id: index + 1,
          productName: item.productName || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          unitOfMeasure: item.unitOfMeasure || 'pcs',
          unitPrice: item.unitPrice || 0,
          hsnCode: item.hsnCode || '',
          taxRate: item.taxRate || 18,
          taxAmount: item.taxAmount || 0,
          totalPrice: item.totalPrice || 0
        })));
      }
    } else {
      // Reset form for new purchase
      setFormData({
        poNumber: '',
        vendorName: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        buyerName: '',
        department: '',
        deliveryAddress: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        paymentTerms: 'Net 30',
        shippingCharges: 0,
        otherCharges: 0,
        discountAmount: 0,
        gstRate: 18,
        quotationFile: null,
        invoiceFile: null,
        notes: '',
        status: 'Draft'
      });

      setItems([{
        id: 1,
        productName: '',
        description: '',
        quantity: 1,
        unitOfMeasure: 'pcs',
        unitPrice: 0,
        hsnCode: '',
        taxRate: 18,
        taxAmount: 0,
        totalPrice: 0
      }]);
    }
  }, [editMode, purchaseData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('deliveryAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [addressField]: value
        }
      }));

      // Handle pincode auto-fill
      if (addressField === 'pincode' && value.length === 6) {
        handlePincodeChange(value);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePincodeChange = async (pincode) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      setPincodeSuccess(false);

      try {
        const result = await pincodeService.getLocationByPincode(pincode);

        if (result.success) {
          setFormData(prev => ({
            ...prev,
            deliveryAddress: {
              ...prev.deliveryAddress,
              city: result.data.city,
              state: result.data.state
            }
          }));
          setPincodeSuccess(true);

          // Hide success message after 3 seconds
          setTimeout(() => {
            setPincodeSuccess(false);
          }, 3000);
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const [fileErrors, setFileErrors] = useState({});

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous errors
      setFileErrors(prev => ({ ...prev, [fileType]: null }));

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFileErrors(prev => ({ ...prev, [fileType]: 'File size must be less than 5MB' }));
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setFileErrors(prev => ({ ...prev, [fileType]: 'Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed' }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const removeFile = (fileType) => {
    setFormData(prev => ({
      ...prev,
      [fileType]: null
    }));
  };

  // // Pincode auto-fill functionality
  // const handlePincodeChange = async (e) => {
  //   const pincode = e.target.value;

  //   // Update pincode in form data
  //   setFormData(prev => ({
  //     ...prev,
  //     deliveryAddress: {
  //       ...prev.deliveryAddress,
  //       pincode: pincode
  //     }
  //   }));

  //   // Auto-fill city and state if pincode is 6 digits
  //   if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
  //     try {
  //       const result = await pincodeService.getLocationByPincode(pincode);

  //       if (result.success) {
  //         setFormData(prev => ({
  //           ...prev,
  //           deliveryAddress: {
  //             ...prev.deliveryAddress,
  //             city: result.data.city,
  //             state: result.data.state
  //           }
  //         }));

  //         // Show minimal success message
  //         toast.success('Location fetched successfully', {
  //           position: "top-right",
  //           autoClose: 2000,
  //           hideProgressBar: true,
  //           closeOnClick: true,
  //           pauseOnHover: false,
  //           draggable: false
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error fetching location:', error);
  //       // Don't show error toast, just silently fail
  //     }
  //   }
  // };

  // Item management functions
  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems(prev => [...prev, {
      id: newId,
      productName: '',
      description: '',
      quantity: 1,
      unitOfMeasure: 'pcs',
      unitPrice: 0,
      hsnCode: '',
      taxRate: 18,
      taxAmount: 0,
      totalPrice: 0
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate totals when quantity, unitPrice, or taxRate changes
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          const quantity = parseFloat(updatedItem.quantity) || 0;
          const unitPrice = parseFloat(updatedItem.unitPrice) || 0;
          const taxRate = parseFloat(updatedItem.taxRate) || 0;
          
          updatedItem.totalPrice = quantity * unitPrice;
          updatedItem.taxAmount = (updatedItem.totalPrice * taxRate) / 100;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + (parseFloat(item.taxAmount) || 0), 0);
    const shippingCharges = parseFloat(formData.shippingCharges) || 0;
    const otherCharges = parseFloat(formData.otherCharges) || 0;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    
    const grandTotal = subtotal + totalTax + shippingCharges + otherCharges - discountAmount;
    
    return {
      subtotal,
      totalTax,
      grandTotal
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - form validation is handled by HTML5 required attributes
    // Additional validation can be added here if needed

    setLoading(true);
    
    try {
      // Prepare form data for submission
      const submitData = new FormData();

      // Add basic form data
      Object.keys(formData).forEach(key => {
        if (key === 'deliveryAddress') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'quotationFile' && key !== 'invoiceFile') {
          submitData.append(key, formData[key] || '');
        }
      });

      // Add items
      submitData.append('items', JSON.stringify(items));

      // Add calculated totals
      submitData.append('subtotal', totals.subtotal);
      submitData.append('taxAmount', totals.totalTax);
      submitData.append('totalAmount', totals.grandTotal);

      // Add currency
      submitData.append('currency', 'INR');

      // Add created by
      submitData.append('createdBy', 'System');

      // Add files
      if (formData.quotationFile) {
        submitData.append('quotationFile', formData.quotationFile);
      }
      if (formData.invoiceFile) {
        submitData.append('invoiceFile', formData.invoiceFile);
      }

      console.log('Submitting form data:', Object.fromEntries(submitData.entries()));

      await onSubmit(submitData);
      
    } catch (error) {
      console.error('Error submitting purchase order:', error);
      toast.error('Error submitting purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${editMode ? 'Edit' : 'Create'} Purchase Order`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Number *
              </label>
              <input
                type="text"
                name="poNumber"
                required
                value={formData.poNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="PO-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendorName"
                required
                value={formData.vendorName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Name *
              </label>
              <input
                type="text"
                name="buyerName"
                required
                value={formData.buyerName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter buyer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                name="orderDate"
                required
                value={formData.orderDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery *
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                required
                value={formData.expectedDeliveryDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <StyledSelect
                value={paymentTermsOptions.find(option => option.value === formData.paymentTerms)}
                onChange={(selectedOption) => {
                  setFormData(prev => ({
                    ...prev,
                    paymentTerms: selectedOption.value
                  }));
                }}
                options={paymentTermsOptions}
                placeholder="Select payment terms"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <StyledSelect
                value={{ value: formData.status, label: formData.status }}
                onChange={(selectedOption) => {
                  setFormData(prev => ({
                    ...prev,
                    status: selectedOption.value
                  }));
                }}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Invoiced', label: 'Invoiced' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                placeholder="Select status"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <StyledSelect
                value={{ value: formData.status, label: formData.status }}
                onChange={(selectedOption) => {
                  setFormData(prev => ({
                    ...prev,
                    status: selectedOption.value
                  }));
                }}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Invoiced', label: 'Invoiced' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                placeholder="Select status"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="deliveryAddress.street"
                required
                value={formData.deliveryAddress.street}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="deliveryAddress.city"
                required
                value={formData.deliveryAddress.city}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handlePincodeChange}
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="deliveryAddress.state"
                required
                value={formData.deliveryAddress.state}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="deliveryAddress.pincode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.deliveryAddress.pincode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  onChange={handleChange}
                  placeholder="Enter 6-digit pincode"
                />
                {pincodeLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {pincodeSuccess && !pincodeLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                )}
              </div>
              {pincodeSuccess && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Location auto-filled successfully
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="deliveryAddress.country"
                value={formData.deliveryAddress.country}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Items</h4>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Item {index + 1}</h5>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.productName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      value={item.hsnCode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                      placeholder="HSN Code"
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      value={item.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Enter product description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={item.quantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit of Measure *
                    </label>
                    <StyledSelect
                      value={uomOptions.find(option => option.value === item.unitOfMeasure)}
                      onChange={(selectedOption) => updateItem(item.id, 'unitOfMeasure', selectedOption.value)}
                      options={uomOptions}
                      placeholder="Select UOM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.taxRate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => updateItem(item.id, 'taxRate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      value={(item.taxAmount || 0).toFixed(2)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price
                    </label>
                    <input
                      type="number"
                      value={(item.totalPrice || 0).toFixed(2)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Charges
              </label>
              <input
                type="number"
                name="shippingCharges"
                min="0"
                step="0.01"
                value={formData.shippingCharges}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Charges
              </label>
              <input
                type="number"
                name="otherCharges"
                min="0"
                step="0.01"
                value={formData.otherCharges}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Amount
              </label>
              <input
                type="number"
                name="discountAmount"
                min="0"
                step="0.01"
                value={formData.discountAmount}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Order Summary</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{(totals.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tax:</span>
                <span className="font-medium">₹{(totals.totalTax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Charges:</span>
                <span className="font-medium">₹{(parseFloat(formData.shippingCharges) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other Charges:</span>
                <span className="font-medium">₹{(parseFloat(formData.otherCharges) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">-₹{(parseFloat(formData.discountAmount) || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">₹{(totals.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">File Uploads</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quotation File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quotation File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {formData.quotationFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload size={16} className="text-blue-600" />
                      <span className="text-sm text-gray-900">{formData.quotationFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile('quotationFile')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-500">
                        Click to upload quotation
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'quotationFile')}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
              {fileErrors.quotationFile && (
                <p className="mt-1 text-sm text-red-600">{fileErrors.quotationFile}</p>
              )}
            </div>

            {/* Invoice File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {formData.invoiceFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload size={16} className="text-blue-600" />
                      <span className="text-sm text-gray-900">{formData.invoiceFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile('invoiceFile')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-500">
                        Click to upload invoice
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'invoiceFile')}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
              {fileErrors.invoiceFile && (
                <p className="mt-1 text-sm text-red-600">{fileErrors.invoiceFile}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              onChange={handleChange}
              placeholder="Additional notes or special instructions"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={loading}
          >
            {loading ? 'Processing...' : (editMode ? 'Update Purchase Order' : 'Create Purchase Order')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnhancedPurchaseOrderModal;
