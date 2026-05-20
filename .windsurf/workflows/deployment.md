---
description: How to deploy frontend and backend to Render
---

# Deployment to Render Workflow

## Prerequisites

1. **GitHub Repository**
   - Push all code to GitHub
   - Ensure `.env` is in `.gitignore` (never commit secrets)

2. **Cloudinary Account**
   - Sign up at cloudinary.com
   - Get credentials from Dashboard → Settings → API Keys

3. **MongoDB Atlas**
   - Create free cluster
   - Get connection string
   - Whitelist Render IP addresses (0.0.0.0/0)

4. **Render Account**
   - Sign up at render.com
   - Free tier available

## Backend Deployment

### Option 1: Using render.yaml (Recommended)

1. **Push code to GitHub**
2. **Go to Render Dashboard**
3. **Click "New +" → "Web Service"**
4. **Connect GitHub repository**
5. **Render will auto-detect** `Backend/render.yaml`
6. **Add Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/roofscout
   JWT_SECRET=your_secure_random_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
7. **Click "Deploy Web Service"**

### Option 2: Manual Configuration

1. **Create Web Service**
   - Name: roofscout-backend
   - Root Directory: `Backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`

2. **Add Environment Variables** (same as above)

3. **Deploy**

## Frontend Deployment

### Option 1: Using render.yaml (Recommended)

1. **Go to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub repository**
4. **Render will auto-detect** `roofscout_react/render.yaml`
5. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. **Click "Deploy Web Service"**

### Option 2: Manual Configuration

1. **Create Web Service**
   - Name: roofscout-frontend
   - Root Directory: `roofscout_react`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Add Environment Variable** (same as above)

3. **Deploy**

## Post-Deployment

1. **Test Backend**
   - Visit backend URL: `https://your-backend.onrender.com`
   - Should see "RoofScout backend running" or similar

2. **Test Frontend**
   - Visit frontend URL: `https://your-frontend.onrender.com`
   - Should see login page

3. **Test API Connection**
   - Try to login/signup
   - Check browser console for errors
   - Check Render logs for backend errors

4. **Update Frontend API URL**
   - If frontend can't connect to backend, update `VITE_API_URL`
   - Redeploy frontend

## Troubleshooting

- **Backend fails to start**: Check Render logs, verify MONGO_URI and Cloudinary credentials
- **Frontend build fails**: Check if `npm run build` works locally
- **CORS errors**: Verify backend CORS allows frontend URL
- **Database connection**: Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access
- **Cloudinary errors**: Verify API key has upload/delete permissions

## Environment Variables Reference

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=random_secret_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
```
