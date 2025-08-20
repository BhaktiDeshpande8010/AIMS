import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import EnhancedPurchaseOrderModal from './EnhancedPurchaseOrderModal';
import PurchaseDetailView from './PurchaseDetailView';
import { generateInvoice, downloadInvoice, purchaseService } from '../../services/purchaseService';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/purchases');
      // setPurchases([
      //   {
      //     _id: '1',
      //     poNumber: "PO-2024-001",
      //     vendorName: "TechCorp Electronics",
      //     totalAmount: 25000,
      //     status: "Pending",
      //     orderDate: "2024-01-15",
      //     expectedDelivery: "2024-01-25"
      //   },
      //   {
      //     _id: '2',
      //     poNumber: "PO-2024-002",
      //     vendorName: "Global Drone Parts Ltd",
      //     totalAmount: 18500,
      //     status: "Delivered",
      //     orderDate: "2024-01-10",
      //     expectedDelivery: "2024-01-20"
      //   }
      // ]);
      if (res.data.success) {
         setPurchases(res.data.purchases);
         setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPurchase = () => {
    setEditMode(false);
    setSelectedPurchase(null);
    setShowModal(true);
  };

  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setViewMode('detail');
  };

  const handleEditPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setEditMode(true);
    setShowModal(true);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPurchase(null);
  };

  const handleDownloadPDF = async (purchase) => {
    try {
      setLoading(true);

      // First generate the invoice if it doesn't exist
      await generateInvoice(purchase._id);

      // Then download it
      await downloadInvoice(purchase._id);

      // Success message
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubmit = async (formData) => {
    try {
      setLoading(true);

      console.log('Submitting enhanced purchase data:', formData);

      // Make API call to create/update purchase order
      let response;
      if (editMode && selectedPurchase?._id) {
        response = await purchaseService.updatePurchase(selectedPurchase._id, formData);
      } else {
        response = await purchaseService.createPurchase(formData);
      }

      if (response.success) {
        toast.success(`Purchase order ${editMode ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        setEditMode(false);
        setSelectedPurchase(null);

        // Refresh the purchases list
        await fetchPurchases();
      } else {
        toast.error(`Failed to ${editMode ? 'update' : 'create'} purchase order: ` + response.message);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} purchase:`, error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} purchase order: ` + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.poNumber}</p>
          <p className="text-sm text-gray-500">{row.orderDate}</p>
        </div>
      )
    },
    {
      header: 'Vendor',
      accessor: 'vendorName'
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (row) => `₹${row.totalAmount.toLocaleString()}`
    },
    {
      header: 'Expected Delivery',
      accessor: 'expectedDeliveryDate',
      render: (row) => {
        if (!row.expectedDeliveryDate) return '-';
        const date = new Date(row.expectedDeliveryDate);
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusColor = 'text-gray-600';
        let statusText = '';

        if (diffDays < 0) {
          statusColor = 'text-red-600';
          statusText = `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
          statusColor = 'text-orange-600';
          statusText = 'Due today';
        } else if (diffDays <= 3) {
          statusColor = 'text-yellow-600';
          statusText = `${diffDays} days left`;
        } else {
          statusColor = 'text-green-600';
          statusText = `${diffDays} days left`;
        }

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString('en-IN')}
            </span>
            <span className={`text-xs ${statusColor}`}>
              {statusText}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const statusColors = {
          'Draft': 'bg-gray-100 text-gray-800',
          'Approved': 'bg-blue-100 text-blue-800',
          'Delivered': 'bg-purple-100 text-purple-800',
          'Invoiced': 'bg-orange-100 text-orange-800',
          'Paid': 'bg-green-100 text-green-800',
          'Cancelled': 'bg-red-100 text-red-800'
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="p-2 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => handleViewPurchase(row)}
            title="View Details"
          >
            <Eye size={16} className="text-blue-600" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 hover:bg-green-50 hover:border-green-300"
            onClick={() => handleEditPurchase(row)}
            title="Edit Purchase"
          >
            <Edit size={16} className="text-green-600" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 hover:bg-purple-50 hover:border-purple-300"
            onClick={() => handleDownloadPDF(row)}
            title="Download PDF Invoice"
          >
            <Download size={16} className="text-purple-600" />
          </Button>
        </div>
      )
    }
  ];

  if (viewMode === 'detail' && selectedPurchase) {
    return <PurchaseDetailView purchase={selectedPurchase} onBack={handleBackToList} onEdit={() => handleEditPurchase(selectedPurchase)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600">Manage your purchase orders and vendor transactions</p>
        </div>
        
        <Button
          onClick={handleAddPurchase}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Purchase Order</span>
        </Button>
      </div>

      {/* Purchases Table */}
      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        currentPage={currentPage}
        totalPages={Math.ceil(purchases.length / 10)}
        onPageChange={setCurrentPage}
        emptyMessage="No purchase orders found"
      />

      {/* Add/Edit Purchase Modal */}
      <EnhancedPurchaseOrderModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedPurchase(null);
        }}
        editMode={editMode}
        purchaseData={selectedPurchase}
        onSubmit={handlePurchaseSubmit}
      />
    </div>
  );
};

export default Purchases;
