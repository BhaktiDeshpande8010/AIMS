import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import { vendorService } from '../../services/vendorService';
import VendorRegistrationModal from './VendorRegistrationModal';
import VendorDetailView from './VendorDetailView';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getVendors({
        page: currentPage,
        limit: 10
      });
      
      if (response.success) {
        setVendors(response.data);
      } else {
        console.error('Failed to fetch vendors:', response.message);
        // Fallback to mock data for now
        // setVendors([
        //   {
        //     _id: '1',
        //     vendorName: "TechCorp Electronics",
        //     vendorType: "Local",
        //     phoneNumber: "+91-9876543210",
        //     address: "123 Tech Park, Bangalore, Karnataka",
        //     status: "Active",
        //     createdAt: "2024-01-15"
        //   },
        //   {
        //     _id: '2',
        //     vendorName: "Global Drone Parts Ltd",
        //     vendorType: "National",
        //     gstNumber: "29AABCU9603R1ZX",
        //     panNumber: "AABCU9603R",
        //     phoneNumber: "+91-9876543211",
        //     email: "contact@globaldroneparts.com",
        //     address: "456 Industrial Area, Mumbai, Maharashtra",
        //     status: "Active",
        //     createdAt: "2024-01-10"
        //   }
        // ]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to mock data
      setVendors([
        {
          _id: '1',
          vendorName: "TechCorp Electronics",
          vendorType: "Local",
          phoneNumber: "+91-9876543210",
          address: "123 Tech Park, Bangalore, Karnataka",
          status: "Active",
          createdAt: "2024-01-15"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = (type) => {
    setModalType(type);
    setEditMode(false);
    setSelectedVendor(null);
    setShowModal(true);
    setShowDropdown(false);
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setViewMode('detail');
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setModalType(vendor.vendorType);
    setEditMode(true);
    setShowModal(true);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedVendor(null);
  };

  const handleVendorSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare vendor data
      const vendorData = {
        ...data,
        vendorType: modalType
      };

      let response;
      if (editMode && selectedVendor) {
        // Update existing vendor
        response = await vendorService.updateVendor(selectedVendor._id, vendorData);
      } else {
        // Create new vendor
        response = await vendorService.createVendor(vendorData);
      }

      if (response.success) {
        toast.success(`Vendor ${editMode ? 'updated' : 'created'}!`);
        setShowModal(false);
        setEditMode(false);
        setSelectedVendor(null);

        // Refresh the vendors list
        await fetchVendors();
      } else {
        toast.error(`Failed to ${editMode ? 'update' : 'create'} vendor`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} vendor:`, error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} vendor`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Vendor Name',
      accessor: 'vendorName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.vendorName}</p>
          <p className="text-sm text-gray-500">{row.vendorType} Vendor</p>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'vendorType',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.vendorType === 'Local' ? 'bg-blue-100 text-blue-800' :
          row.vendorType === 'National' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {row.vendorType}
        </span>
      )
    },
    {
      header: 'GST/PAN',
      accessor: 'gstNumber',
      render: (row) => row.gstNumber || row.panNumber || 'N/A'
    },
    {
      header: 'Contact',
      accessor: 'phoneNumber'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
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
            onClick={() => handleViewVendor(row)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 text-xs font-medium"
            onClick={() => handleEditVendor(row)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  if (viewMode === 'detail' && selectedVendor) {
    return <VendorDetailView vendor={selectedVendor} onBack={handleBackToList} onEdit={() => handleEditVendor(selectedVendor)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Manage your vendor relationships</p>
        </div>
        
        <div className="relative">
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Vendor</span>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleAddVendor('Local')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Local Vendor
                </button>
                <button
                  onClick={() => handleAddVendor('National')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  National Vendor
                </button>
                <button
                  onClick={() => handleAddVendor('International')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  International Vendor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Table */}
      <DataTable
        columns={columns}
        data={vendors}
        loading={loading}
        currentPage={currentPage}
        totalPages={Math.ceil(vendors.length / 10)}
        onPageChange={setCurrentPage}
        emptyMessage="No vendors found"
      />

      {/* Add/Edit Vendor Modal */}
      <VendorRegistrationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedVendor(null);
        }}
        type={modalType}
        editMode={editMode}
        vendorData={selectedVendor}
        onSubmit={handleVendorSubmit}
      />
    </div>
  );
};

export default Vendors;
