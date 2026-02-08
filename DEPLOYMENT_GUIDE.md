# 🚀 Felicity Event Booking - Deployment Guide

This guide will help you deploy the application to production.

## Prerequisites
- GitHub account (code should be pushed to GitHub)
- MongoDB Atlas account (free tier available)
- Render account (for backend) OR Railway/Fly.io
- Vercel account (for frontend) OR Netlify
- Google reCAPTCHA keys (for production domain)
- Gmail account with App Password (for emails)

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and a new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Add `/felicity` before the `?` to specify the database name

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/felicity?retryWrites=true&w=majority
```

**Important:** In Atlas, go to Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard

1. Go to [Render](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `felicity-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables (click "Environment"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-a-random-64-char-string>
   FRONTEND_URL=https://your-frontend.vercel.app  (update after frontend deploy)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail>
   EMAIL_PASSWORD=<your-gmail-app-password>
   RECAPTCHA_SECRET_KEY=<your-recaptcha-secret>
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy the URL (e.g., `https://felicity-backend.onrender.com`)

### Generate JWT Secret
Run this in terminal to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://felicity-backend.onrender.com/api
   REACT_APP_RECAPTCHA_SITE_KEY=<your-recaptcha-site-key>
   ```

6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Copy the URL (e.g., `https://felicity-frontend.vercel.app`)

### Option B: Using Netlify

1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`

5. Add Environment Variables in Site Settings:
   ```
   REACT_APP_API_URL=https://felicity-backend.onrender.com/api
   REACT_APP_RECAPTCHA_SITE_KEY=<your-recaptcha-site-key>
   ```

6. Deploy

---

## Step 4: Update Backend with Frontend URL

1. Go back to Render Dashboard
2. Select your backend service
3. Go to Environment
4. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL=https://felicity-frontend.vercel.app
   ```
5. The service will automatically redeploy

---

## Step 5: Update reCAPTCHA for Production

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Edit your reCAPTCHA keys or create new ones
3. Add your production domains:
   - `felicity-frontend.vercel.app`
   - `your-custom-domain.com` (if using)
4. Update the keys in your environment variables

---

## Step 6: Setup Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already
3. Go to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "Felicity Backend"
6. Copy the 16-character password
7. Use this as `EMAIL_PASSWORD` (not your Gmail password)

---

## Step 7: Create Admin Account

After deployment, create an admin account:

1. SSH into your backend or use Render's shell
2. Or run locally connected to production DB:
   ```bash
   cd backend
   MONGODB_URI=<production-uri> node scripts/createAdmin.js
   ```

---

## Step 8: Update deployment.txt

Update the `deployment.txt` file in the root with your actual URLs:

```
Frontend URL: https://felicity-frontend.vercel.app
Backend API URL: https://felicity-backend.onrender.com
```

---

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### CORS errors
- Verify FRONTEND_URL is set correctly in backend
- Make sure it includes `https://` and no trailing slash

### Emails not sending
- Verify Gmail App Password is correct
- Check if "Less secure app access" is needed
- Look at backend logs for email errors

### reCAPTCHA failing
- Verify domain is added in Google reCAPTCHA console
- Check that site key (frontend) and secret key (backend) match

### Database connection issues
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure password doesn't have special characters that need encoding

---

## Free Tier Limitations

### Render (Free)
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month

### Vercel (Free)
- Generous free tier for static sites
- Serverless functions have cold starts

### MongoDB Atlas (Free)
- 512MB storage
- Shared cluster
- Good for small-medium projects

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed

Remember to update reCAPTCHA with custom domain!

---

## Quick Commands

```bash
# Test backend health
curl https://felicity-backend.onrender.com/api/health

# Check MongoDB connection (locally)
MONGODB_URI=<uri> node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(e => console.error(e))"
```

---

Good luck with your deployment! 🎉
