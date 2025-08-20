import express from 'express';
import path from 'path';
import fs from 'fs';
import PurchaseOrder from '../models/PurchaseOrder.js';

const router = express.Router();

// Download quotation file
router.get('/quotation/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    
    const purchase = await PurchaseOrder.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    if (!purchase.quotationFile || !purchase.quotationFile.path) {
      return res.status(404).json({
        success: false,
        message: 'Quotation file not found'
      });
    }
    
    const filePath = purchase.quotationFile.path;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Quotation file not found on server'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${purchase.quotationFile.originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(path.resolve(filePath));
    
  } catch (error) {
    console.error('Error downloading quotation file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading quotation file'
    });
  }
});

// Download invoice file
router.get('/invoice/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    
    const purchase = await PurchaseOrder.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    if (!purchase.invoiceFile || !purchase.invoiceFile.path) {
      return res.status(404).json({
        success: false,
        message: 'Invoice file not found'
      });
    }
    
    const filePath = purchase.invoiceFile.path;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Invoice file not found on server'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${purchase.invoiceFile.originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(path.resolve(filePath));
    
  } catch (error) {
    console.error('Error downloading invoice file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading invoice file'
    });
  }
});

// View/preview file (for images and PDFs)
router.get('/preview/:type/:purchaseId', async (req, res) => {
  try {
    const { type, purchaseId } = req.params;
    
    if (!['quotation', 'invoice'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }
    
    const purchase = await PurchaseOrder.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    const fileField = type === 'quotation' ? 'quotationFile' : 'invoiceFile';
    const file = purchase[fileField];
    
    if (!file || !file.path) {
      return res.status(404).json({
        success: false,
        message: `${type} file not found`
      });
    }
    
    const filePath = file.path;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `${type} file not found on server`
      });
    }
    
    // Set appropriate content type for preview
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    
    // Send file for preview
    res.sendFile(path.resolve(filePath));
    
  } catch (error) {
    console.error('Error previewing file:', error);
    res.status(500).json({
      success: false,
      message: 'Error previewing file'
    });
  }
});

// Get file information
router.get('/info/:type/:purchaseId', async (req, res) => {
  try {
    const { type, purchaseId } = req.params;
    
    if (!['quotation', 'invoice'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }
    
    const purchase = await PurchaseOrder.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    const fileField = type === 'quotation' ? 'quotationFile' : 'invoiceFile';
    const file = purchase[fileField];
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: `${type} file not found`
      });
    }
    
    // Check if file exists on disk
    const fileExists = file.path ? fs.existsSync(file.path) : false;
    
    res.json({
      success: true,
      data: {
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        uploadedAt: file.uploadedAt,
        exists: fileExists,
        downloadUrl: `/api/files/${type}/${purchaseId}`,
        previewUrl: `/api/files/preview/${type}/${purchaseId}`
      }
    });
    
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file information'
    });
  }
});

export default router;
