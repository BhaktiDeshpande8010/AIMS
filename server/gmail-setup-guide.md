# 📧 Gmail Setup Guide for OTP Emails

## 🎯 Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication
1. **Go to:** https://myaccount.google.com/security
2. **Find:** "2-Step Verification" 
3. **Click:** "Get started" or "Turn on"
4. **Follow:** The setup process (use your phone number)

### Step 2: Generate App Password
1. **Go to:** https://myaccount.google.com/apppasswords
2. **Sign in** again if prompted
3. **Select:** "Mail" from the dropdown
4. **Click:** "Generate"
5. **Copy:** The 16-character password (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace this line in your `.env` file:
```
EMAIL_PASS=REPLACE_WITH_YOUR_APP_PASSWORD
```

With your actual app password:
```
EMAIL_PASS=your-16-character-password-here
```

### Step 4: Restart Server
```bash
npm run dev
```

### Step 5: Test
1. Go to http://localhost:3000/vendors
2. Click "Add Vendor"
3. Use email: sarthakjoshi12005@gmail.com
4. Submit form
5. **Check your Gmail inbox!** 📧

## 🔧 Troubleshooting

**If emails still don't arrive:**

1. **Check Spam folder** in Gmail
2. **Verify App Password** is correct (no spaces)
3. **Ensure 2FA is enabled** on your Google account
4. **Try generating a new App Password**

## 🧪 Test Command
```bash
curl -X POST http://localhost:5003/api/vendors/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "sarthakjoshi12005@gmail.com", "purpose": "vendor_registration"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "sarthakjoshi12005@gmail.com",
    "expiresIn": "10 minutes",
    "realEmail": true
  }
}
```

## 📱 Alternative: Use App-Specific Password

If you have trouble with App Passwords:

1. **Go to:** https://myaccount.google.com/security
2. **Find:** "App passwords" 
3. **Generate** a new password specifically for "Mail"
4. **Use that password** in your .env file

---

**Need help?** The system will show detailed error messages in the server logs if something goes wrong.
