import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = async () => {
  // Check if real email credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS &&
      process.env.EMAIL_USER !== 'ethereal.user@ethereal.email' &&
      process.env.EMAIL_USER !== 'test@ethereal.email' &&
      process.env.EMAIL_USER !== 'your-email@gmail.com') {
    console.log('📧 Using real email service:', process.env.EMAIL_SERVICE || 'gmail');

    // Use real email service (Gmail, Outlook, etc.)
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Fallback to Ethereal Email for testing
  try {
    console.log('📧 Using Ethereal Email for testing (emails won\'t reach real inboxes)');

    // Create test account
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.log('📧 Email service unavailable, using console logging');
    // Fallback to console logging
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }
};

// Send OTP email
export const sendOTPEmail = async (email, otp, purpose = 'vendor_registration') => {
  try {
    const purposeText = {
      'vendor_registration': 'Vendor Registration',
      'vendor_update': 'Vendor Update',
      'password_reset': 'Password Reset',
      'email_verification': 'Email Verification'
    };

    // Always send real emails now (using test account for development)
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@agridrone.com',
      to: email,
      subject: `${purposeText[purpose]} - OTP Verification`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚁 Agri-Drone Accounts</h1>
              <p>OTP Verification Required</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You have requested an OTP for <strong>${purposeText[purpose]}</strong>.</p>

              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                  <li>Do not share this code with anyone</li>
                  <li>Maximum 3 attempts allowed</li>
                </ul>
              </div>

              <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>

              <div class="footer">
                <p>Best regards,<br>Agri-Drone Accounts Team</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('📧 OTP Email sent:', info.messageId);

    // Check if this is a real email service or test service
    const isRealEmail = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'ethereal.user@ethereal.email';

    if (isRealEmail) {
      console.log('✅ Real email sent to:', email);
      return {
        success: true,
        messageId: info.messageId,
        realEmail: true,
        message: 'OTP sent to your email address'
      };
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Test email preview:', previewUrl);
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl,
        realEmail: false,
        message: 'Test email sent (check preview URL)'
      };
    }

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after vendor registration
export const sendWelcomeEmail = async (vendorData) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@agridrone.com',
      to: vendorData.email,
      subject: 'Welcome to Agri-Drone Vendor Network!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Agri-Drone</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚁 Welcome to Agri-Drone!</h1>
              <p>Your vendor registration is complete</p>
            </div>
            <div class="content">
              <h2>Congratulations, ${vendorData.vendorName}!</h2>
              <p>Your vendor account has been successfully created and verified.</p>
              
              <div class="info-box">
                <h3>📋 Your Registration Details:</h3>
                <ul>
                  <li><strong>Vendor Name:</strong> ${vendorData.vendorName}</li>
                  <li><strong>Vendor Type:</strong> ${vendorData.vendorType}</li>
                  <li><strong>Email:</strong> ${vendorData.email}</li>
                  <li><strong>Phone:</strong> ${vendorData.phoneNumber}</li>
                  <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
              </div>
              
              <h3>🚀 What's Next?</h3>
              <ul>
                <li>Our team will review your application within 24-48 hours</li>
                <li>You'll receive a confirmation email once approved</li>
                <li>Start receiving purchase orders from Agri-Drone</li>
                <li>Access our vendor portal for order management</li>
              </ul>
              
              <p>If you have any questions, please don't hesitate to contact our vendor support team.</p>
              
              <div class="footer">
                <p>Best regards,<br>Agri-Drone Vendor Relations Team</p>
                <p><strong>📞 Support:</strong> +91-XXXX-XXXX-XX | <strong>📧 Email:</strong> vendor-support@agridrone.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Welcome email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    // Don't throw error for welcome email failure
    return {
      success: false,
      error: error.message
    };
  }
};
