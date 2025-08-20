#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEmail() {
  console.log('\n🚀 Agri-Drone Email Configuration Setup\n');
  console.log('This will help you configure real email sending for OTP verification.\n');

  const service = await question('Choose email service (gmail/outlook/hotmail): ');
  const email = await question('Enter your email address: ');
  
  if (service.toLowerCase() === 'gmail') {
    console.log('\n📧 Gmail Setup Instructions:');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Enable 2-Factor Authentication');
    console.log('3. Go to https://myaccount.google.com/apppasswords');
    console.log('4. Generate an App Password for "Mail"');
    console.log('5. Use that App Password below (not your regular password)\n');
  }
  
  const password = await question('Enter your email password/app-password: ');
  const fromEmail = await question('Enter "From" email address (or press Enter for default): ') || 'noreply@agridrone.com';

  // Read current .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('Creating new .env file...');
  }

  // Update email configuration
  const emailConfig = `
# Email Configuration (for OTP) - Real Email Service
EMAIL_SERVICE=${service.toLowerCase()}
EMAIL_USER=${email}
EMAIL_PASS=${password}
EMAIL_FROM=${fromEmail}`;

  // Replace existing email config or add new one
  if (envContent.includes('EMAIL_SERVICE=')) {
    envContent = envContent.replace(
      /# Email Configuration[\s\S]*?EMAIL_FROM=.*$/m,
      emailConfig.trim()
    );
  } else {
    envContent += '\n' + emailConfig;
  }

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Email configuration saved to .env file!');
  console.log('\n🔄 Please restart the server to apply changes:');
  console.log('   npm run dev\n');
  
  console.log('🧪 Test your configuration by:');
  console.log('1. Starting the server');
  console.log('2. Going to http://localhost:3000/vendors');
  console.log('3. Adding a new vendor with your email address');
  console.log('4. Check your email inbox for the OTP\n');

  rl.close();
}

setupEmail().catch(console.error);
