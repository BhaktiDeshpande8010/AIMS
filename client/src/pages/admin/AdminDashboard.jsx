import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Users, 
  ShoppingCart, 
  UserCheck, 
  Building, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalsLoading, setApprovalsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingApprovals();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      setApprovalsLoading(true);
      const response = await adminService.getPendingApprovals({ type: 'all' });
      if (response.success) {
        setPendingApprovals(response.data.approvals || []);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setApprovalsLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      const response = await adminService.approveItem(type, id);
      if (response.success) {
        toast.success(`${type} approved successfully`);
        fetchPendingApprovals();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async (type, id, reason) => {
    try {
      const response = await adminService.rejectItem(type, id, reason);
      if (response.success) {
        toast.success(`${type} rejected successfully`);
        fetchPendingApprovals();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    }
  };

  const getApprovalColumns = () => [
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.type === 'employee' ? 'bg-blue-100 text-blue-800' :
          row.type === 'purchase' ? 'bg-green-100 text-green-800' :
          row.type === 'vendor' ? 'bg-purple-100 text-purple-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </span>
      )
    },
    {
      header: 'Name/ID',
      accessor: 'name',
      render: (row) => {
        if (row.type === 'employee') {
          return `${row.firstName} ${row.lastName}`;
        } else if (row.type === 'purchase') {
          return row.poNumber;
        } else if (row.type === 'vendor') {
          return row.vendorName;
        } else if (row.type === 'customer') {
          return row.customerName;
        }
        return 'N/A';
      }
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (row) => {
        if (row.type === 'employee') {
          return `${row.department} - ${row.designation}`;
        } else if (row.type === 'purchase') {
          return `${row.vendorName} - ₹${row.totalAmount?.toLocaleString()}`;
        } else if (row.type === 'vendor') {
          return row.contactPerson;
        } else if (row.type === 'customer') {
          return row.contactPerson;
        }
        return 'N/A';
      }
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => handleApprove(row.type, row._id)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
          >
            <CheckCircle size={14} className="mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const reason = prompt('Enter rejection reason:');
              if (reason) {
                handleReject(row.type, row._id, reason);
              }
            }}
            className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1"
          >
            <XCircle size={14} className="mr-1" />
            Reject
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage approvals and monitor system activity</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.pendingApprovals?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.systemOverview?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Activity</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.systemOverview?.totalLogs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.systemOverview?.successRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="text-xl font-bold text-blue-600">
                {dashboardData?.pendingApprovals?.employees || 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Purchases</p>
              <p className="text-xl font-bold text-green-600">
                {dashboardData?.pendingApprovals?.purchases || 0}
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vendors</p>
              <p className="text-xl font-bold text-purple-600">
                {dashboardData?.pendingApprovals?.vendors || 0}
              </p>
            </div>
            <Building className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-xl font-bold text-orange-600">
                {dashboardData?.pendingApprovals?.customers || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
          <p className="text-sm text-gray-600">Items waiting for your approval</p>
        </div>
        <div className="p-6">
          <DataTable
            columns={getApprovalColumns()}
            data={pendingApprovals}
            loading={approvalsLoading}
            emptyMessage="No pending approvals"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
