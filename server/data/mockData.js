// Mock data for the agricultural drone manufacturing accounts system

export const vendors = [
  {
    id: 1,
    name: "TechCorp Electronics",
    type: "Local",
    contactNo: "+91-9876543210",
    address: "123 Tech Park, Bangalore, Karnataka",
    goodsServices: "Electronic Components, Sensors",
    notes: "Reliable supplier for drone sensors",
    status: "Active",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Global Drone Parts Ltd",
    type: "National",
    gstNo: "29AABCU9603R1ZX",
    pan: "AABCU9603R",
    contactNo: "+91-9876543211",
    email: "contact@globaldroneparts.com",
    address: "456 Industrial Area, Mumbai, Maharashtra",
    bankDetails: "HDFC Bank, A/c: 12345678901",
    status: "Active",
    createdAt: "2024-01-10"
  },
  {
    id: 3,
    name: "AeroTech International",
    type: "International",
    country: "Germany",
    contactNo: "+49-123-456-7890",
    email: "sales@aerotech.de",
    currency: "EUR",
    swiftIban: "DE89370400440532013000",
    importLicenseNo: "IMP/2024/001",
    address: "789 Aviation Street, Munich, Germany",
    status: "Active",
    createdAt: "2024-01-05"
  },
  {
    id: 4,
    name: "Battery Solutions India",
    type: "National",
    gstNo: "27AABCU9603R1ZY",
    pan: "AABCU9603S",
    contactNo: "+91-9876543212",
    email: "info@batterysolutions.in",
    address: "321 Power Street, Chennai, Tamil Nadu",
    bankDetails: "SBI Bank, A/c: 98765432101",
    status: "Active",
    createdAt: "2024-01-12"
  },
  {
    id: 5,
    name: "Local Motors & Gears",
    type: "Local",
    contactNo: "+91-9876543213",
    address: "654 Mechanical Hub, Pune, Maharashtra",
    goodsServices: "Motors, Gears, Mechanical Parts",
    notes: "Local supplier for mechanical components",
    status: "Pending",
    createdAt: "2024-01-18"
  }
];

export const customers = [
  {
    id: 1,
    fullName: "Rajesh Kumar",
    companyName: "AgriTech Solutions Pvt Ltd",
    email: "rajesh@agritech.com",
    contactNo: "+91-9876543220",
    gst: "29AABCA9603R1ZX",
    country: "India",
    state: "Karnataka",
    address: "123 Farm Tech Park, Bangalore",
    paymentTerms: "Net 30",
    type: "Domestic",
    notes: "Large distributor for South India",
    createdAt: "2024-01-10"
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    companyName: "Precision Agriculture Inc",
    email: "sarah@precisionag.com",
    contactNo: "+1-555-123-4567",
    gst: "",
    country: "USA",
    state: "California",
    address: "456 Innovation Drive, San Francisco",
    paymentTerms: "Net 15",
    type: "International",
    notes: "US distributor for precision farming",
    createdAt: "2024-01-08"
  },
  {
    id: 3,
    fullName: "Amit Patel",
    companyName: "FarmDrone India",
    email: "amit@farmdrone.in",
    contactNo: "+91-9876543221",
    gst: "24AABCA9603R1ZY",
    country: "India",
    state: "Gujarat",
    address: "789 Agri Complex, Ahmedabad",
    paymentTerms: "Net 45",
    type: "Domestic",
    notes: "Regional distributor for Gujarat",
    createdAt: "2024-01-15"
  }
];

export const employees = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Dr. Priya Sharma",
    role: "Senior Research Engineer",
    department: "RnD",
    contactNo: "+91-9876543230",
    email: "priya.sharma@agridrone.com",
    address: "123 Tech Colony, Bangalore",
    dateOfJoining: "2023-03-15",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Arjun Reddy",
    role: "Flight Test Engineer",
    department: "Flight Lab",
    contactNo: "+91-9876543231",
    email: "arjun.reddy@agridrone.com",
    address: "456 Aviation Street, Bangalore",
    dateOfJoining: "2023-05-20",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Sneha Gupta",
    role: "Quality Control Manager",
    department: "QC",
    contactNo: "+91-9876543232",
    email: "sneha.gupta@agridrone.com",
    address: "789 Quality Lane, Bangalore",
    dateOfJoining: "2023-01-10",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Vikram Singh",
    role: "Production Supervisor",
    department: "Production",
    contactNo: "+91-9876543233",
    email: "vikram.singh@agridrone.com",
    address: "321 Manufacturing Hub, Bangalore",
    dateOfJoining: "2023-07-01",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Anita Desai",
    role: "HR Manager",
    department: "HR/Admin",
    contactNo: "+91-9876543234",
    email: "anita.desai@agridrone.com",
    address: "654 Admin Block, Bangalore",
    dateOfJoining: "2023-02-28",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  }
];

export const purchases = [
  {
    id: 1,
    purchaseId: "PUR001",
    date: "2024-01-20",
    vendorId: 1,
    vendorName: "TechCorp Electronics",
    item: "Flight Controller Boards",
    quantity: 50,
    unitPrice: 2500,
    gst: 18,
    total: 147500,
    paymentStatus: "Paid",
    invoiceFile: "invoice_001.pdf",
    createdAt: "2024-01-20"
  },
  {
    id: 2,
    purchaseId: "PUR002",
    date: "2024-01-19",
    vendorId: 2,
    vendorName: "Global Drone Parts Ltd",
    item: "Carbon Fiber Propellers",
    quantity: 200,
    unitPrice: 150,
    gst: 18,
    total: 35400,
    paymentStatus: "Unpaid",
    invoiceFile: "invoice_002.pdf",
    createdAt: "2024-01-19"
  },
  {
    id: 3,
    purchaseId: "PUR003",
    date: "2024-01-18",
    vendorId: 4,
    vendorName: "Battery Solutions India",
    item: "LiPo Batteries 6S 22000mAh",
    quantity: 25,
    unitPrice: 8500,
    gst: 18,
    total: 250750,
    paymentStatus: "Partial",
    invoiceFile: "invoice_003.pdf",
    createdAt: "2024-01-18"
  },
  {
    id: 4,
    purchaseId: "PUR004",
    date: "2024-01-17",
    vendorId: 3,
    vendorName: "AeroTech International",
    item: "GPS Navigation Modules",
    quantity: 30,
    unitPrice: 12000,
    gst: 18,
    total: 424800,
    paymentStatus: "Paid",
    invoiceFile: "invoice_004.pdf",
    createdAt: "2024-01-17"
  },
  {
    id: 5,
    purchaseId: "PUR005",
    date: "2024-01-16",
    vendorId: 5,
    vendorName: "Local Motors & Gears",
    item: "Servo Motors",
    quantity: 100,
    unitPrice: 450,
    gst: 18,
    total: 53100,
    paymentStatus: "Unpaid",
    invoiceFile: "invoice_005.pdf",
    createdAt: "2024-01-16"
  }
];

export const procurementRequests = [
  {
    id: 1,
    requestId: "REQ001",
    employeeId: 1,
    employeeName: "Dr. Priya Sharma",
    date: "2024-01-20",
    item: "Research Equipment - Oscilloscope",
    quantity: 1,
    cost: 85000,
    status: "Approved"
  },
  {
    id: 2,
    requestId: "REQ002",
    employeeId: 1,
    employeeName: "Dr. Priya Sharma",
    date: "2024-01-15",
    item: "Development Board - ARM Cortex",
    quantity: 5,
    cost: 12500,
    status: "Pending"
  },
  {
    id: 3,
    requestId: "REQ003",
    employeeId: 2,
    employeeName: "Arjun Reddy",
    date: "2024-01-18",
    item: "Flight Test Equipment",
    quantity: 1,
    cost: 45000,
    status: "Approved"
  },
  {
    id: 4,
    requestId: "REQ004",
    employeeId: 3,
    employeeName: "Sneha Gupta",
    date: "2024-01-19",
    item: "Quality Testing Tools",
    quantity: 3,
    cost: 25000,
    status: "Pending"
  }
];

export const recentActivities = [
  {
    id: 1,
    type: "vendor",
    action: "New vendor registered",
    description: "Local Motors & Gears added as local vendor",
    timestamp: "2024-01-18T10:30:00Z"
  },
  {
    id: 2,
    type: "purchase",
    action: "Purchase order created",
    description: "PUR005 for Servo Motors worth ₹53,100",
    timestamp: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    type: "employee",
    action: "Procurement request",
    description: "Dr. Priya Sharma requested Research Equipment",
    timestamp: "2024-01-20T09:15:00Z"
  },
  {
    id: 4,
    type: "payment",
    action: "Payment processed",
    description: "Payment of ₹4,24,800 to AeroTech International",
    timestamp: "2024-01-17T16:45:00Z"
  },
  {
    id: 5,
    type: "customer",
    action: "New customer added",
    description: "Amit Patel from FarmDrone India registered",
    timestamp: "2024-01-15T11:30:00Z"
  }
];

// Helper functions to generate IDs
export const generateId = (array) => {
  return Math.max(...array.map(item => item.id), 0) + 1;
};

export const generatePurchaseId = () => {
  const lastId = Math.max(...purchases.map(p => parseInt(p.purchaseId.slice(3))), 0);
  return `PUR${String(lastId + 1).padStart(3, '0')}`;
};

export const generateRequestId = () => {
  const lastId = Math.max(...procurementRequests.map(r => parseInt(r.requestId.slice(3))), 0);
  return `REQ${String(lastId + 1).padStart(3, '0')}`;
};

export const generateEmployeeId = () => {
  const lastId = Math.max(...employees.map(e => parseInt(e.employeeId.slice(3))), 0);
  return `EMP${String(lastId + 1).padStart(3, '0')}`;
};
