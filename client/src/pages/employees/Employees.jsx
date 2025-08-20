import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import EmployeeRegistrationModal from './EmployeeRegistrationModal';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees();
      if (response.success) {
        setEmployees(response.data);
      } else {
        toast.error('Failed to load employees');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditMode(false);
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleViewEmployee = (employee) => {
    navigate(`/employees/${employee._id}`);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditMode(true);
    setShowModal(true);
  };

  const handleEmployeeSubmit = async (data) => {
    try {
      setLoading(true);

      let response;
      if (editMode && selectedEmployee?._id) {
        // Update employee (if update endpoint exists)
        response = await employeeService.updateEmployee(selectedEmployee._id, data);
      } else {
        // Create new employee
        response = await employeeService.createEmployee(data);
      }

      if (response.success) {
        toast.success(`Employee ${editMode ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        setEditMode(false);
        setSelectedEmployee(null);

        // Refresh the employees list
        await fetchEmployees();
      } else {
        toast.error(`Failed to ${editMode ? 'update' : 'create'} employee: ` + response.message);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} employee:`, error);
      toast.error(`Failed to ${editMode ? 'update' : 'create'} employee: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.employeeName}</p>
          <p className="text-sm text-gray-500">{row.employeeId}</p>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Position',
      accessor: 'position'
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
            onClick={() => handleViewEmployee(row)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 text-xs font-medium"
            onClick={() => handleEditEmployee(row)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>

        <Button
          onClick={handleAddEmployee}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium"
        >
          Add Employee
        </Button>
      </div>

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        currentPage={currentPage}
        totalPages={Math.ceil(employees.length / 10)}
        onPageChange={setCurrentPage}
        emptyMessage="No employees found"
      />

      {/* Add/Edit Employee Modal */}
      <EmployeeRegistrationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedEmployee(null);
        }}
        editMode={editMode}
        employeeData={selectedEmployee}
        onSubmit={handleEmployeeSubmit}
      />
    </div>
  );
};

export default Employees;
