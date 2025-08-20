import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import connectDB from '../config/database.js';

// Sample vendors data
const sampleVendors = [
  {
    vendorName: "TechCorp Electronics",
    legalStructure: "Pvt Ltd",
    businessType: "Manufacturer",
    vendorType: "National",
    email: "contact@techcorp.com",
    phoneNumber: "9876543210",
    address: "123 Tech Park, Electronic City",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560100",
    panNumber: "AABCT1234C",
    gstNumber: "29AABCT1234C1Z5",
    dateOfIncorporation: "2015-03-15",
    websiteLink: "https://techcorp.com",
    bankName: "HDFC Bank",
    branchName: "Electronic City",
    ifscCode: "HDFC0001234",
    accountNumber: "12345678901234",
    accountHolderName: "TechCorp Electronics Pvt Ltd",
    currency: "INR",
    undertakingName: "Rajesh Kumar",
    undertakingEmail: "rajesh@techcorp.com",
    status: "Active",
    isVerified: true
  },
  {
    vendorName: "Global Drone Parts Ltd",
    legalStructure: "Public Ltd",
    businessType: "Trader",
    vendorType: "National",
    email: "sales@globaldroneparts.com",
    phoneNumber: "9876543211",
    address: "456 Industrial Area, Sector 18",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    panNumber: "AABCG5678D",
    gstNumber: "27AABCG5678D1Z8",
    dateOfIncorporation: "2018-07-20",
    websiteLink: "https://globaldroneparts.com",
    bankName: "ICICI Bank",
    branchName: "Andheri West",
    ifscCode: "ICIC0001234",
    accountNumber: "98765432109876",
    accountHolderName: "Global Drone Parts Ltd",
    currency: "INR",
    undertakingName: "Priya Sharma",
    undertakingEmail: "priya@globaldroneparts.com",
    status: "Active",
    isVerified: true
  },
  {
    vendorName: "AeroTech International",
    legalStructure: "Pvt Ltd",
    businessType: "Manufacturer",
    vendorType: "International",
    email: "info@aerotech.de",
    phoneNumber: "4912345678",
    address: "789 Aviation Street, Munich",
    city: "Munich",
    state: "Bavaria",
    pincode: "800331",
    country: "Germany",
    swiftCode: "DEUTDEFF",
    accountNumber: "DE89370400440532013000",
    accountHolderName: "AeroTech International GmbH",
    bankName: "Deutsche Bank",
    branchName: "Munich Central",
    currency: "EUR",
    undertakingName: "Hans Mueller",
    undertakingEmail: "hans@aerotech.de",
    status: "Active",
    isVerified: true
  }
];

// Sample products data
const sampleProducts = [
  {
    productName: "High-Performance Drone Battery",
    productCode: "BAT-001",
    description: "Lithium-ion battery pack for agricultural drones, 22.2V 16000mAh",
    category: "Batteries",
    subcategory: "Lithium-ion",
    unitPrice: 15000,
    currency: "INR",
    costPrice: 12000,
    sellingPrice: 18000,
    currentStock: 50,
    minimumStock: 10,
    reorderLevel: 15,
    unit: "Piece",
    specifications: {
      weight: "2.5 kg",
      dimensions: "300x150x80 mm",
      material: "Lithium-ion",
      warranty: "1 year",
      certifications: ["CE", "FCC", "RoHS"]
    },
    status: "Active"
  },
  {
    productName: "Carbon Fiber Propeller Set",
    productCode: "PROP-001",
    description: "High-strength carbon fiber propellers for precision agriculture drones",
    category: "Propellers",
    subcategory: "Carbon Fiber",
    unitPrice: 2500,
    currency: "INR",
    costPrice: 2000,
    sellingPrice: 3000,
    currentStock: 100,
    minimumStock: 20,
    reorderLevel: 25,
    unit: "Set",
    specifications: {
      weight: "150 g",
      dimensions: "24 inch diameter",
      material: "Carbon Fiber",
      warranty: "6 months"
    },
    status: "Active"
  },
  {
    productName: "Precision GPS Module",
    productCode: "GPS-001",
    description: "RTK GPS module for centimeter-level accuracy in drone navigation",
    category: "Electronics",
    subcategory: "GPS",
    unitPrice: 25000,
    currency: "INR",
    costPrice: 20000,
    sellingPrice: 30000,
    currentStock: 25,
    minimumStock: 5,
    reorderLevel: 8,
    unit: "Piece",
    specifications: {
      weight: "200 g",
      dimensions: "100x80x30 mm",
      material: "Aluminum",
      warranty: "2 years",
      certifications: ["CE", "FCC"]
    },
    status: "Active"
  }
];

// Function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Vendor.deleteMany({});
    await Product.deleteMany({});
    await PurchaseOrder.deleteMany({});
    
    // Insert vendors
    console.log('👥 Inserting vendors...');
    const insertedVendors = await Vendor.insertMany(sampleVendors);
    console.log(`✅ Inserted ${insertedVendors.length} vendors`);
    
    // Update products with vendor IDs
    const updatedProducts = sampleProducts.map((product, index) => ({
      ...product,
      primaryVendorId: insertedVendors[index % insertedVendors.length]._id
    }));
    
    // Insert products
    console.log('📦 Inserting products...');
    const insertedProducts = await Product.insertMany(updatedProducts);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    
    // Create sample purchase orders
    console.log('📋 Creating sample purchase orders...');
    const sampleOrders = [];
    
    for (let i = 0; i < 10; i++) {
      const vendor = insertedVendors[i % insertedVendors.length];
      const product = insertedProducts[i % insertedProducts.length];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = product.unitPrice;
      const totalPrice = quantity * unitPrice;
      
      const order = {
        poNumber: `PO-2024-${String(i + 1).padStart(3, '0')}`,
        vendorId: vendor._id,
        vendorName: vendor.vendorName,
        orderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        expectedDeliveryDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in next 30 days
        items: [{
          productId: product._id,
          productName: product.productName,
          description: product.description,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        }],
        subtotal: totalPrice,
        taxAmount: totalPrice * 0.18, // 18% GST
        totalAmount: totalPrice * 1.18,
        currency: "INR",
        status: ['Pending', 'Approved', 'Shipped', 'Delivered', 'Completed'][Math.floor(Math.random() * 5)],
        quotationNumber: `QUO-2024-${String(i + 1).padStart(3, '0')}`,
        hsnCode: ['8525', '8471', '8517', '9013'][Math.floor(Math.random() * 4)],
        gstRate: [5, 12, 18, 28][Math.floor(Math.random() * 4)],
        notes: `Sample order for ${product.productName}`,
        createdBy: 'System Seeder'
      };
      
      sampleOrders.push(order);
    }
    
    const insertedOrders = await PurchaseOrder.insertMany(sampleOrders);
    console.log(`✅ Inserted ${insertedOrders.length} purchase orders`);
    
    // Update vendor statistics
    console.log('📊 Updating vendor statistics...');
    for (const vendor of insertedVendors) {
      const vendorOrders = insertedOrders.filter(order => order.vendorId.toString() === vendor._id.toString());
      if (vendorOrders.length > 0) {
        vendor.totalOrders = vendorOrders.length;
        vendor.totalOrderValue = vendorOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        vendor.lastOrderDate = Math.max(...vendorOrders.map(order => order.orderDate));
        await vendor.save();
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Vendors: ${insertedVendors.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Purchase Orders: ${insertedOrders.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder if called directly
if (process.argv[2] === 'seed') {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
