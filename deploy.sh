#!/bin/bash

# Agri-Drone Accounts System - Deployment Script
echo "🚀 Preparing Agri-Drone Accounts System for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Agri-Drone Accounts System"
else
    echo "📝 Adding changes to Git..."
    git add .
    git commit -m "Prepare for deployment - $(date)"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No Git remote found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/agri-drone-accounts.git"
    echo "   git push -u origin main"
else
    echo "📤 Pushing to GitHub..."
    git push origin main
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "🔗 Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Select the render.yaml file"
echo "5. Set environment variables in Render dashboard"
echo "6. Click 'Apply' to deploy"
echo ""
echo "📋 Required Environment Variables for Backend:"
echo "   - NODE_ENV=production"
echo "   - MONGODB_URI=your-mongodb-connection-string"
echo "   - JWT_SECRET=your-secret-key"
echo "   - EMAIL_USER=your-gmail@gmail.com"
echo "   - EMAIL_PASS=your-gmail-app-password"
echo ""
echo "🎉 Happy deploying!"
