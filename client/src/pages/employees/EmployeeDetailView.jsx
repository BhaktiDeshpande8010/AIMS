import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Phone, Mail, Building, User } from 'lucide-react';
import Button from '../../components/Button';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-toastify';
import ProcurementModal from './ProcurementModal';

const EmployeeDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProcurementModal, setShowProcurementModal] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployeeById(id);
      if (response.success) {
        setEmployee(response.data);
      } else {
        toast.error('Failed to load employee details');
        navigate('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcurement = () => {
    setShowProcurementModal(true);
  };

  const handleProcurementSubmit = async (procurementData) => {
    try {
      const response = await employeeService.createProcurementRequest(id, procurementData);
      if (response.success) {
        toast.success('Procurement request created successfully!');
        setShowProcurementModal(false);
        // Refresh employee data to get updated procurement requests
        await fetchEmployeeDetails();
      } else {
        toast.error('Failed to create procurement request: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating procurement request:', error);
      toast.error('Failed to create procurement request: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:w-4/5 xl:w-3/4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:w-4/5 xl:w-3/4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Employee not found</p>
              <Button onClick={() => navigate('/employees')}>Back to Employees</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:w-4/5 xl:w-3/4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/employees')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>Back to Employees</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">{employee.employeeName}</h1>
                <p className="text-blue-600">{employee.position} • {employee.department}</p>
              </div>
            </div>
            
            <Button
              onClick={handleAddProcurement}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Add Procurement</span>
            </Button>
          </div>

          {/* Employee Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-gray-900">{employee.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{employee.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-gray-900">{employee.department}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joining Date</p>
                    <p className="text-gray-900">
                      {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                    employee.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-gray-900">{employee.position}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{employee.address}</p>
                    <p className="text-gray-600">{employee.city}, {employee.state}</p>
                    <p className="text-gray-600">{employee.pincode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          {employee.bankDetails && (employee.bankDetails.bankName || employee.bankDetails.accountNumber) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {employee.bankDetails.accountHolderName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Holder</p>
                    <p className="text-gray-900">{employee.bankDetails.accountHolderName}</p>
                  </div>
                )}
                {employee.bankDetails.bankName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bank Name</p>
                    <p className="text-gray-900">{employee.bankDetails.bankName}</p>
                  </div>
                )}
                {employee.bankDetails.accountNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Number</p>
                    <p className="text-gray-900">****{employee.bankDetails.accountNumber.slice(-4)}</p>
                  </div>
                )}
                {employee.bankDetails.ifscCode && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                    <p className="text-gray-900">{employee.bankDetails.ifscCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Procurement Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Procurement Requests</h3>
                <p className="text-sm text-gray-500">Recent procurement requests by this employee</p>
              </div>
              <div className="text-sm text-gray-500">
                Total: {employee.procurementRequests?.length || 0} requests
              </div>
            </div>
            <div className="p-6">
              {employee.procurementRequests && employee.procurementRequests.length > 0 ? (
                <div className="space-y-4">
                  {employee.procurementRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{request.procurementId}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Products</p>
                          <p className="font-medium">{request.totalProducts}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Quantity</p>
                          <p className="font-medium">{request.totalQuantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Cost</p>
                          <p className="font-medium">₹{request.grandTotal?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Priority</p>
                          <p className="font-medium">{request.priority}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No procurement requests found</p>
                  <Button
                    onClick={handleAddProcurement}
                    className="mt-4"
                    variant="outline"
                  >
                    Create First Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Procurement Modal */}
      <ProcurementModal
        isOpen={showProcurementModal}
        onClose={() => setShowProcurementModal(false)}
        onSubmit={handleProcurementSubmit}
        employee={employee}
      />
    </div>
  );
};

export default EmployeeDetailView;
