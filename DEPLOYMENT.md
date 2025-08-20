# 🚀 Agri-Drone Accounts System - Deployment Guide

## Deployment on Render

This application is configured for deployment on Render with the following architecture:

### 🏗️ Architecture
- **Backend API**: Node.js/Express server
- **Frontend**: React SPA (Single Page Application)
- **Database**: MongoDB Atlas
- **File Storage**: Local filesystem (upgradeable to cloud storage)

### 📋 Prerequisites
1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Database already configured

### 🔧 Deployment Steps

#### Option 1: Using Render Blueprint (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the `render.yaml` file
   - Click "Apply"

#### Option 2: Manual Deployment

##### Backend Deployment:
1. **Create Web Service**:
   - Service Type: Web Service
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://bhaktiabhay99:prym_inventory@aims.t6epzsk.mongodb.net/AccountsIMS?retryWrites=true&w=majority&appName=AIMS
   JWT_SECRET=your-super-secret-jwt-key-for-production
   JWT_EXPIRE=30d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

##### Frontend Deployment:
1. **Create Static Site**:
   - Service Type: Static Site
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```

### 🔐 Security Configuration

#### Environment Variables to Set:
- `JWT_SECRET`: Generate a strong secret key
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Gmail App Password (not regular password)
- `MONGODB_URI`: Your MongoDB Atlas connection string

#### CORS Configuration:
The server is configured to allow requests from:
- Production: `https://your-frontend.onrender.com`
- Development: `http://localhost:3001`

### 📊 Post-Deployment

#### Health Check:
- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-frontend.onrender.com`

#### Default Users:
The system automatically creates default users:
- **Admin**: admin@agridrone.com / admin123
- **Accounts**: accounts@agridrone.com / accounts123

### 🔧 Troubleshooting

#### Common Issues:
1. **CORS Errors**: Update allowed origins in server.js
2. **Database Connection**: Verify MongoDB URI and network access
3. **Environment Variables**: Ensure all required vars are set
4. **Build Failures**: Check Node.js version compatibility

#### Logs:
- Check Render service logs for detailed error information
- Monitor MongoDB Atlas logs for database issues

### 🚀 Performance Optimization

#### Backend:
- Uses MongoDB Atlas for scalable database
- Configured for production environment
- Health check endpoint for monitoring

#### Frontend:
- Vite build optimization
- Static site deployment for fast loading
- Environment-based API configuration

### 📈 Scaling

#### Free Tier Limitations:
- Backend: Sleeps after 15 minutes of inactivity
- Database: 512MB storage limit
- Bandwidth: Limited monthly transfer

#### Upgrade Path:
- Paid plans for always-on services
- Larger database storage
- Custom domains
- Enhanced performance

### 🔄 CI/CD

#### Auto-Deploy:
- Connected to GitHub repository
- Automatic deployments on push to main branch
- Build status notifications

### 📞 Support

For deployment issues:
1. Check Render documentation
2. Review service logs
3. Verify environment variables
4. Test API endpoints manually

---

**🎉 Your Agri-Drone Accounts System is ready for production deployment!**
