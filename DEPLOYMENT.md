# 🚀 Deployment Guide: Build-Track (Construction Task Tracker)

This application can be deployed in two convenient ways:
1. **Option A (Recommended & Easiest): Full-Stack Unified Deploy (Render / Railway)**  
   The Express server serves both the REST API and the React frontend static build (`frontend/dist`) on a single URL. This requires only 1 service, 1 environment, and has **zero CORS issues**.
2. **Option B: Decoupled Deploy (Vercel/Netlify for Frontend + Render/Railway for Backend)**  
   Frontend is deployed on a static hosting provider and talks to the backend via `VITE_API_BASE`.

---

## 🛠️ Option A: Full-Stack Unified Deployment (Render / Railway)

### On [Render.com](https://render.com):
1. Create a **New Web Service** and connect your GitHub repository.
2. Select **Node** as the runtime environment.
3. Configure the build and start commands:
   * **Root Directory:** *(leave blank / repository root)*
   * **Build Command:**
     ```bash
     npm --prefix server install && npm --prefix frontend install && npm --prefix frontend run build
     ```
   * **Start Command:**
     ```bash
     npm --prefix server start
     ```
4. Add the following **Environment Variables**:
   * `NODE_ENV` = `production`
   * `MONGO_URI` = `your_mongodb_connection_string`
   * `JWT_SECRET` = `generate_a_long_random_secret_key`
   * `REFRESH_TOKEN_SECRET` = `generate_another_long_random_secret_key`
   * `CLIENT_ORIGIN` = `https://your-render-app-name.onrender.com`
5. Click **Deploy Web Service**. Once built, opening your Render URL will load the app directly!

---

## 🌐 Option B: Decoupled Deployment (Vercel Frontend + Render Backend)

### Step 1: Deploy Backend (Render / Railway)
1. Set **Root Directory** to `server`.
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Set Environment Variables:
   * `MONGO_URI`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`
   * `CLIENT_ORIGIN` = `https://your-frontend.vercel.app` (your Vercel frontend URL)
5. Copy your deployed backend URL (e.g. `https://my-backend.onrender.com`).

### Step 2: Deploy Frontend (Vercel / Netlify)
1. On Vercel, import your repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   * `VITE_API_BASE` = `https://my-backend.onrender.com/api`
5. Click **Deploy**.

---

## 🔒 Post-Deployment Checklist
- [ ] Replace any placeholder `JWT_SECRET` and `REFRESH_TOKEN_SECRET` with random strings (minimum 32 characters).
- [ ] In MongoDB Atlas, ensure your Network Access whitelist allows connections from `0.0.0.0/0` (standard for serverless/cloud platforms).
- [ ] Never commit `.env` containing production database passwords to public repositories.
