# CampusConnect Production Deployment Guide

## 1. Architecture Overview
For cloud production hosting:
- **Frontend**: Vercel / Netlify / Render Static Site (SPA routing)
- **Backend**: Render / Railway / Fly.io / AWS App Runner (Node.js Express)
- **Relational Database**: Neon / Supabase / AWS RDS (PostgreSQL 14+)
- **Document Database**: MongoDB Atlas (Free M0 Cluster)

---

## 2. Step-by-Step Deployment Procedure

### Phase A: Database Provisioning (Neon / Supabase)
1. Create a PostgreSQL project on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-host.region.neon.tech/campusconnect?sslmode=require"
   ```
3. Set `provider = "postgresql"` in `backend/prisma/schema.prisma` (if targeting PostgreSQL directly).
4. Run migrations from your terminal:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```

### Phase B: Document Store Provisioning (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Configure network access to allow IP `0.0.0.0/0`.
3. Copy connection URI:
   ```env
   MONGODB_URI="mongodb+srv://admin:password@cluster0.mongodb.net/campusconnect_logs?retryWrites=true&w=majority"
   ```

### Phase C: Backend Deployment (Render / Railway)
1. Push your repository to GitHub.
2. Link repository to Render as a **Web Service**.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node src/server.js`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your hosted Postgres URL)*
   - `MONGODB_URI`: *(Your MongoDB Atlas URI)*
   - `CORS_ORIGIN`: `https://campusconnect.vercel.app`
5. Deploy and verify health endpoint:
   `GET https://campusconnect-api.onrender.com/api/health`

### Phase D: Frontend Deployment (Vercel)
1. Link repository to Vercel.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://campusconnect-api.onrender.com/api`
4. Deploy and verify complete browsing and registration workflow in live browser.

---

## 3. Environment Variables Reference

| Variable | Scope | Description | Sample Value |
|---|---|---|---|
| `PORT` | Backend | HTTP Port | `5000` |
| `NODE_ENV` | Backend | Runtime Mode | `production` |
| `DATABASE_URL` | Backend | Relational Database URI | `postgresql://...` or `file:./dev.db` |
| `MONGODB_URI` | Backend | Document Store URI | `mongodb://localhost:27017/...` |
| `CORS_ORIGIN` | Backend | Allowed CORS Origins | `https://campusconnect.vercel.app` |
| `VITE_API_BASE_URL` | Frontend | Backend API endpoint | `http://localhost:5000/api` |
