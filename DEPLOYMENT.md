# Deployment Guide

## Backend Deployment on Render

### Environment Variables to Set on Render:

1. **NODE_ENV**: `production`
2. **MONGODB_URI**: Your MongoDB Atlas connection string
3. **JWT_SECRET**: A secure random string (at least 32 characters)
4. **JWT_EXPIRE**: `7d`
5. **CORS_ORIGIN**: `https://hr-sarthi.vercel.app`
6. **FRONTEND_URL**: `https://hr-sarthi.vercel.app`
7. **PORT**: `5000` (Render will override this automatically)

### Build Command:
```
npm install
```

### Start Command:
```
npm start
```

### Important Notes:
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Render's dynamic IPs
- The CORS configuration now supports Vercel preview deployments automatically
- Health check endpoint available at `/api/health`

## Frontend Deployment on Vercel

### Environment Variables to Set on Vercel:

1. **VITE_API_URL**: `https://your-render-app-name.onrender.com`

### Build Settings:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Domain Configuration:
- Primary domain: `hr-sarthi.vercel.app`
- Make sure this matches the CORS_ORIGIN in your backend

## Troubleshooting CORS Issues:

1. Verify environment variables are set correctly on both platforms
2. Check that the frontend URL matches exactly in CORS_ORIGIN
3. Ensure MongoDB Atlas allows connections from Render's IPs
4. Test the health endpoint: `https://your-backend-url.onrender.com/api/health`