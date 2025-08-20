// agri-drone-accounts/server/services/pdfService.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PDFService {
  constructor() {
    this.companyInfo = {
      name: 'Agri-Drone Solutions Pvt Ltd',
      address: '123 Tech Park, Electronic City',
      city: 'Bangalore, Karnataka - 560100',
      phone: '+91-80-1234-5678',
      email: 'info@agridrone.com',
      website: 'www.agridrone.com',
      gst: '29AABCA1234C1Z5'
    };
  }

  // Generate Invoice PDF
  async generateInvoice(invoiceData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'INVOICE');
        
        // Company Info
        this.addCompanyInfo(doc);
        
        // Invoice Details
        this.addInvoiceDetails(doc, invoiceData);
        
        // Customer/Vendor Info
        this.addCustomerInfo(doc, invoiceData.customer || invoiceData.vendor);
        
        // Items Table
        this.addItemsTable(doc, invoiceData.items);
        
        // Totals
        this.addTotals(doc, invoiceData);
        
        // Footer
        this.addFooter(doc, invoiceData.terms);

        doc.end();
        
        stream.on('finish', () => {
          resolve(outputPath);
        });
        
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate Bill PDF
  async generateBill(billData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'PURCHASE BILL');
        
        // Company Info
        this.addCompanyInfo(doc);
        
        // Bill Details
        this.addBillDetails(doc, billData);
        
        // Vendor Info
        this.addVendorInfo(doc, billData.vendor);
        
        // Items Table
        this.addItemsTable(doc, billData.items);
        
        // Totals
        this.addTotals(doc, billData);
        
        // Footer
        this.addFooter(doc, 'Payment terms as per purchase order');

        doc.end();
        
        stream.on('finish', () => {
          resolve(outputPath);
        });
        
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Add Header
  addHeader(doc, title) {
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(title, 50, 50)
       .fontSize(12)
       .font('Helvetica');
  }

  // Add Company Information
  addCompanyInfo(doc) {
    const startY = 100;
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(this.companyInfo.name, 50, startY)
       .fontSize(10)
       .font('Helvetica')
       .text(this.companyInfo.address, 50, startY + 20)
       .text(this.companyInfo.city, 50, startY + 35)
       .text(`Phone: ${this.companyInfo.phone}`, 50, startY + 50)
       .text(`Email: ${this.companyInfo.email}`, 50, startY + 65)
       .text(`GST: ${this.companyInfo.gst}`, 50, startY + 80);
  }

  // Add Invoice Details
  addInvoiceDetails(doc, invoiceData) {
    const startY = 100;
    const rightX = 400;
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Invoice Number:', rightX, startY)
       .font('Helvetica')
       .text(invoiceData.invoiceNumber, rightX + 80, startY)
       .font('Helvetica-Bold')
       .text('Invoice Date:', rightX, startY + 15)
       .font('Helvetica')
       .text(new Date(invoiceData.invoiceDate).toLocaleDateString(), rightX + 80, startY + 15)
       .font('Helvetica-Bold')
       .text('Due Date:', rightX, startY + 30)
       .font('Helvetica')
       .text(new Date(invoiceData.dueDate).toLocaleDateString(), rightX + 80, startY + 30);
       
    if (invoiceData.poNumber) {
      doc.font('Helvetica-Bold')
         .text('PO Number:', rightX, startY + 45)
         .font('Helvetica')
         .text(invoiceData.poNumber, rightX + 80, startY + 45);
    }
  }

  // Add Bill Details
  addBillDetails(doc, billData) {
    const startY = 100;
    const rightX = 400;
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Bill Number:', rightX, startY)
       .font('Helvetica')
       .text(billData.billNumber, rightX + 80, startY)
       .font('Helvetica-Bold')
       .text('Bill Date:', rightX, startY + 15)
       .font('Helvetica')
       .text(new Date(billData.billDate).toLocaleDateString(), rightX + 80, startY + 15)
       .font('Helvetica-Bold')
       .text('PO Number:', rightX, startY + 30)
       .font('Helvetica')
       .text(billData.poNumber, rightX + 80, startY + 30);
  }

  // Add Customer Information
  addCustomerInfo(doc, customer) {
    const startY = 220;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 50, startY)
       .fontSize(10)
       .font('Helvetica')
       .text(customer.name || customer.customerName, 50, startY + 20)
       .text(customer.address, 50, startY + 35)
       .text(`${customer.city}, ${customer.state} - ${customer.pincode}`, 50, startY + 50);
       
    if (customer.gstNumber) {
      doc.text(`GST: ${customer.gstNumber}`, 50, startY + 65);
    }
  }

  // Add Vendor Information
  addVendorInfo(doc, vendor) {
    const startY = 220;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Vendor:', 50, startY)
       .fontSize(10)
       .font('Helvetica')
       .text(vendor.name || vendor.vendorName, 50, startY + 20)
       .text(vendor.address, 50, startY + 35)
       .text(`${vendor.city}, ${vendor.state} - ${vendor.pincode}`, 50, startY + 50);
       
    if (vendor.gstNumber) {
      doc.text(`GST: ${vendor.gstNumber}`, 50, startY + 65);
    }
  }

  // Add Items Table
  addItemsTable(doc, items) {
    const startY = 320;
    const tableTop = startY;
    
    // Table Headers
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Description', 50, tableTop)
       .text('Qty', 300, tableTop)
       .text('Unit Price', 350, tableTop)
       .text('Total', 450, tableTop);
    
    // Draw header line
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();
    
    let currentY = tableTop + 25;
    
    // Table Rows
    items.forEach((item, index) => {
      doc.fontSize(9)
         .font('Helvetica')
         .text(item.description || item.productName, 50, currentY, { width: 240 })
         .text(item.quantity.toString(), 300, currentY)
         .text(`₹${item.unitPrice.toLocaleString()}`, 350, currentY)
         .text(`₹${item.totalPrice.toLocaleString()}`, 450, currentY);
      
      currentY += 20;
      
      // Add page break if needed
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    // Draw bottom line
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .stroke();
       
    return currentY + 10;
  }

  // Add Totals
  addTotals(doc, data) {
    const startY = doc.y + 20;
    const rightX = 400;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('Subtotal:', rightX, startY)
       .text(`₹${data.subtotal.toLocaleString()}`, rightX + 80, startY);
    
    if (data.discountAmount && data.discountAmount > 0) {
      doc.text('Discount:', rightX, startY + 15)
         .text(`-₹${data.discountAmount.toLocaleString()}`, rightX + 80, startY + 15);
    }
    
    if (data.taxAmount && data.taxAmount > 0) {
      doc.text('Tax (GST):', rightX, startY + 30)
         .text(`₹${data.taxAmount.toLocaleString()}`, rightX + 80, startY + 30);
    }
    
    // Draw line above total
    doc.moveTo(rightX, startY + 45)
       .lineTo(550, startY + 45)
       .stroke();
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Total Amount:', rightX, startY + 50)
       .text(`₹${data.totalAmount.toLocaleString()}`, rightX + 80, startY + 50);
  }

  // Add Footer
  addFooter(doc, terms) {
    const footerY = 700;
    
    if (terms) {
      doc.fontSize(9)
         .font('Helvetica')
         .text('Terms & Conditions:', 50, footerY)
         .text(terms, 50, footerY + 15, { width: 500 });
    }
    
    // Add page number
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .text(`Page ${i + 1} of ${pages.count}`, 50, 750);
    }
  }

  // Ensure directory exists
  ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Generate unique filename
  generateFilename(prefix, extension = 'pdf') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
  }
}

export default new PDFService();
