import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import HSNModal from './HSNModal';

const HSN = () => {
  const [hsnCodes, setHsnCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHSN, setSelectedHSN] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchHSNCodes();
    fetchProducts();
  }, []);

  const fetchHSNCodes = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await hsnService.getHSNCodes();
      
      // Mock data for now
      const mockHSNCodes = [
        {
          _id: '1',
          hsnCode: '85258019',
          hsnDetails: 'Digital cameras and video camera recorders',
          gst: 18,
          bcd: 10,
          sw: 0,
          part: 'Electronics',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          hsnCode: '84713000',
          hsnDetails: 'Portable automatic data processing machines',
          gst: 18,
          bcd: 0,
          sw: 0,
          part: 'Computers',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          hsnCode: '90138090',
          hsnDetails: 'Other optical devices and instruments',
          gst: 12,
          bcd: 7.5,
          sw: 10,
          part: 'Optical Equipment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setHsnCodes(mockHSNCodes);
    } catch (error) {
      console.error('Error fetching HSN codes:', error);
      toast.error('Failed to fetch HSN codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await productService.getProducts();
      
      // Mock data for now
      const mockProducts = [
        {
          _id: '1',
          productName: 'High-Performance Drone Battery',
          productCode: 'DRN-BAT-001',
          description: 'Lithium-ion battery pack for agricultural drones',
          category: 'Electronics',
          price: 15000,
          stock: 50
        },
        {
          _id: '2',
          productName: 'Carbon Fiber Propeller Set',
          productCode: 'DRN-PROP-001',
          description: 'High-strength carbon fiber propellers',
          category: 'Mechanical Parts',
          price: 2500,
          stock: 100
        },
        {
          _id: '3',
          productName: 'Precision GPS Module',
          productCode: 'DRN-GPS-001',
          description: 'RTK GPS module for centimeter-level accuracy',
          category: 'Electronics',
          price: 25000,
          stock: 25
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddHSN = () => {
    setSelectedHSN(null);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditHSN = (hsn) => {
    setSelectedHSN(hsn);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteHSN = async (hsn) => {
    if (window.confirm(`Are you sure you want to delete HSN code ${hsn.hsnCode}?`)) {
      try {
        // TODO: Replace with actual API call
        // await hsnService.deleteHSN(hsn._id);
        
        // Mock deletion
        setHsnCodes(hsnCodes.filter(h => h._id !== hsn._id));
        toast.success('HSN code deleted successfully!');
      } catch (error) {
        console.error('Error deleting HSN code:', error);
        toast.error('Failed to delete HSN code');
      }
    }
  };

  const handleHSNSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (editMode && selectedHSN) {
        // TODO: Replace with actual API call
        // const response = await hsnService.updateHSN(selectedHSN._id, data);
        
        // Mock update
        const updatedHSN = { ...selectedHSN, ...data, updatedAt: new Date().toISOString() };
        setHsnCodes(hsnCodes.map(h => h._id === selectedHSN._id ? updatedHSN : h));
        toast.success('HSN code updated successfully!');
      } else {
        // TODO: Replace with actual API call
        // const response = await hsnService.createHSN(data);
        
        // Mock creation
        const newHSN = {
          _id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setHsnCodes([...hsnCodes, newHSN]);
        toast.success('HSN code created successfully!');
      }
      
      setShowModal(false);
      setEditMode(false);
      setSelectedHSN(null);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} HSN code:`, error);
      alert(`Failed to ${editMode ? 'update' : 'create'} HSN code`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'HSN Code',
      accessor: 'hsnCode',
      render: (row) => (
        <div className="font-medium text-gray-900">{row.hsnCode}</div>
      )
    },
    {
      header: 'Description',
      accessor: 'hsnDetails',
      render: (row) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate" title={row.hsnDetails}>
            {row.hsnDetails}
          </div>
        </div>
      )
    },
    {
      header: 'GST (%)',
      accessor: 'gst',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">{row.gst}%</span>
      )
    },
    {
      header: 'BCD (%)',
      accessor: 'bcd',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">{row.bcd}%</span>
      )
    },
    {
      header: 'SW (%)',
      accessor: 'sw',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">{row.sw}%</span>
      )
    },
    {
      header: 'Part',
      accessor: 'part',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.part}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="p-2 hover:bg-green-50 hover:border-green-300"
            onClick={() => handleEditHSN(row)}
            title="Edit HSN"
          >
            <Edit size={16} className="text-green-600" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="p-2 hover:bg-red-50 hover:border-red-300"
            onClick={() => handleDeleteHSN(row)}
            title="Delete HSN"
          >
            <Trash2 size={16} className="text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HSN Management</h1>
          <p className="text-gray-600">Manage HSN codes, tax rates, and product classifications</p>
        </div>
        
        <Button
          onClick={handleAddHSN}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add HSN Code</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total HSN Codes</p>
              <p className="text-2xl font-semibold text-gray-900">{hsnCodes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Products</p>
              <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg GST Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {hsnCodes.length > 0 ? (hsnCodes.reduce((sum, hsn) => sum + hsn.gst, 0) / hsnCodes.length).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(hsnCodes.map(hsn => hsn.part)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HSN Codes Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={hsnCodes}
          columns={columns}
          loading={loading}
          emptyMessage="No HSN codes found. Add your first HSN code to get started."
        />
      </div>

      {/* HSN Modal */}
      <HSNModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedHSN(null);
        }}
        editMode={editMode}
        hsnData={selectedHSN}
        products={products}
        onSubmit={handleHSNSubmit}
      />
    </div>
  );
};

export default HSN;
