# Render Deployment Guide

## 🚀 Deploying Real Estate AI Backend to Render

### 1. **Prepare Your Repository**
- Ensure your code is pushed to GitHub/GitLab
- Make sure all changes are committed

### 2. **Render Dashboard Setup**
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `Real-estate-AI-backend` directory

### 3. **Build Configuration**
```yaml
Build Command: npm install && npm run postinstall
Start Command: npm start
```

### 4. **Environment Variables**
Set these in Render dashboard:
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id
RAPIDAPI_API_KEY=your_rapidapi_key
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. **Advanced Settings**
- **Instance Type**: Starter (or higher for production)
- **Region**: Choose closest to your users
- **Auto-Deploy**: Enable for automatic deployments

### 6. **Disk Storage**
Add a disk for Puppeteer cache:
- **Name**: cache
- **Mount Path**: /opt/render/.cache
- **Size**: 1GB

### 7. **Deploy**
Click "Create Web Service" and wait for deployment

## 🔧 Troubleshooting

### If Chrome/Puppeteer fails:
1. Check logs for specific error messages
2. Verify environment variables are set
3. Ensure disk storage is properly mounted

### Memory Issues:
- Upgrade to a higher instance type
- Monitor memory usage in Render dashboard

### PDF Generation Timeouts:
- The system has 60-second timeout for browser launch
- 30-second timeout for page loading
- Consider optimizing HTML template if issues persist

## 📝 Notes
- First deployment may take 5-10 minutes due to Chrome installation
- Subsequent deployments will be faster due to caching
- The system automatically installs Chrome during the build process 