import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import CustomerRegistrationModal from './CustomerRegistrationModal';
import IndividualCustomerForm from '../../components/IndividualCustomerForm';
import OrganizationalCustomerForm from '../../components/OrganizationalCustomerForm';
import { customerService } from '../../services/customerService';
import CustomerDetailView from './CustomerDetailView';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showIndividualForm, setShowIndividualForm] = useState(false);
  const [showOrganizationalForm, setShowOrganizationalForm] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();

      if (response.success) {
        setCustomers(response.data);
      } else {
        console.error('Failed to fetch customers:', response.message);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = (type) => {
    if (type === 'Individual') {
      setShowIndividualForm(true);
    } else if (type === 'Organizational') {
      setShowOrganizationalForm(true);
    } else {
      setModalType(type);
      setEditMode(false);
      setSelectedCustomer(null);
      setShowModal(true);
    }
    setShowDropdown(false);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewMode('detail');
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setModalType(customer.customerType);
    setEditMode(true);
    setShowModal(true);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
  };

  const handleCustomerSubmit = async (data) => {
    try {
      setLoading(true);

      let response;
      if (editMode && selectedCustomer) {
        response = await customerService.updateCustomer(selectedCustomer._id, data);
      } else {
        response = await customerService.createCustomer(data);
      }

      if (response.success) {
        toast.success(`Customer ${editMode ? 'updated' : 'created'} successfully!`);
      } else {
        toast.error(`Failed to ${editMode ? 'update' : 'create'} customer: ${response.message}`);
        return;
      }
      setShowModal(false);
      setEditMode(false);
      setSelectedCustomer(null);

      // Refresh the customers list
      await fetchCustomers();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} customer:`, error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} customer: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualCustomerSubmit = async (formData) => {
    try {
      setFormLoading(true);

      const response = await customerService.createIndividualCustomer(formData);

      if (response.success) {
        toast.success('Individual customer created successfully and sent for admin approval!');
        setShowIndividualForm(false);

        // Refresh the customers list
        await fetchCustomers();
      } else {
        toast.error(`Failed to create individual customer: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating individual customer:', error);
      toast.error('Failed to create individual customer: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOrganizationalCustomerSubmit = async (formData) => {
    try {
      setFormLoading(true);

      const response = await customerService.createOrganizationalCustomer(formData);

      if (response.success) {
        toast.success('Organizational customer created successfully and sent for admin approval!');
        setShowOrganizationalForm(false);

        // Refresh the customers list
        await fetchCustomers();
      } else {
        toast.error(`Failed to create organizational customer: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating organizational customer:', error);
      toast.error('Failed to create organizational customer: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleGenerateReceipt = async (customer) => {
    try {
      const response = await customerService.generateReceipt(customer._id);

      if (response) {
        // Open receipt in new window
        const newWindow = window.open('', '_blank');
        newWindow.document.write(response);
        newWindow.document.close();

        toast.success('Receipt generated successfully!');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const columns = [
    {
      header: 'Customer Name',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.customerName}</p>
          <p className="text-sm text-gray-500">{row.customerType} Customer</p>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'customerType',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.customerType === 'Individual' ? 'bg-blue-100 text-blue-800' :
          row.customerType === 'Organizational' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {row.customerType}
        </span>
      )
    },
    {
      header: 'Contact',
      accessor: 'phoneNumber'
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'Registered' ? 'bg-green-100 text-green-800' :
            row.status === 'Active' ? 'bg-green-100 text-green-800' :
            row.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {row.status}
          </span>
          {row.customerType === 'Individual' && (
            <div className="flex items-center space-x-1">
              {row.approvalStatus === 'Pending' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Approval
                </span>
              )}
              {row.approvalStatus === 'Approved' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </span>
              )}
              {row.approvalStatus === 'Rejected' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium"
            onClick={() => handleViewCustomer(row)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 text-xs font-medium"
            onClick={() => handleEditCustomer(row)}
          >
            Edit
          </Button>
          {row.customerType === 'Individual' && row.approvalStatus === 'Approved' && (
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 hover:bg-green-50 px-3 py-1.5 text-xs font-medium"
              onClick={() => handleGenerateReceipt(row)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Receipt
            </Button>
          )}
        </div>
      )
    }
  ];

  if (viewMode === 'detail' && selectedCustomer) {
    return <CustomerDetailView customer={selectedCustomer} onBack={handleBackToList} onEdit={() => handleEditCustomer(selectedCustomer)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        
        <div className="relative">
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Customer</span>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleAddCustomer('Individual')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Individual Customer
                </button>
                <button
                  onClick={() => handleAddCustomer('Organizational')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Organizational Customer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        currentPage={currentPage}
        totalPages={Math.ceil(customers.length / 10)}
        onPageChange={setCurrentPage}
        emptyMessage="No customers found"
      />

      {/* Individual Customer Form */}
      <IndividualCustomerForm
        isOpen={showIndividualForm}
        onClose={() => setShowIndividualForm(false)}
        onSubmit={handleIndividualCustomerSubmit}
        loading={formLoading}
      />

      {/* Organizational Customer Form */}
      <OrganizationalCustomerForm
        isOpen={showOrganizationalForm}
        onClose={() => setShowOrganizationalForm(false)}
        onSubmit={handleOrganizationalCustomerSubmit}
        loading={formLoading}
      />

      {/* Add/Edit Customer Modal */}
      <CustomerRegistrationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedCustomer(null);
        }}
        type={modalType}
        editMode={editMode}
        customerData={selectedCustomer}
        onSubmit={handleCustomerSubmit}
      />
    </div>
  );
};

export default Customers;
