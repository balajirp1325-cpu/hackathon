# 🚀 FoodBridge Deployment Guide

## Quick Vercel Deployment (Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: FoodBridge app ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/foodbridge.git
git push -u origin main
```

### Step 2: Create PostgreSQL Database
**Option A: Vercel Postgres (Easiest)**
1. Go to [https://vercel.com/postgres](https://vercel.com/postgres)
2. Click "Create Database"
3. Copy the connection string (looks like: `postgresql://user:password@host/foodbridge`)

**Option B: Railway.app (Alternative)**
1. Go to [https://railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from Railway dashboard

**Option C: Supabase (Alternative)**
1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the connection string

### Step 3: Deploy to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add Environment Variables:
   - `DATABASE_PROVIDER` = `postgresql`
   - `DATABASE_URL` = (your PostgreSQL connection string)
   - `JWT_SECRET` = (generate a random secure string, e.g., `openssl rand -hex 32`)
   - `JWT_REFRESH_SECRET` = (another random secure string)
   - `CLIENT_URL` = (your Vercel domain, e.g., https://foodbridge-xyz.vercel.app)
   - `NODE_ENV` = `production`

4. Click "Deploy"

### Step 4: Run Database Migrations
After deployment:
```bash
# In Vercel dashboard, go to your project
# Click "Deployments" → Select latest deployment
# Open the function URL in browser or use:
DATABASE_URL="your-postgresql-url" npx prisma migrate deploy
```

Or use a Vercel Function to run migrations automatically. Contact support or see below.

### Step 5: Test Deployment
```bash
curl https://your-vercel-domain.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T00:00:00Z",
  "uptime": 123
}
```

---

## Environment Variables Reference

```env
# Database Configuration
DATABASE_PROVIDER=postgresql        # Change from 'sqlite' to 'postgresql'
DATABASE_URL=postgresql://user:password@host/dbname

# Security
JWT_SECRET=generate-random-secure-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-random-secure-string
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-vercel-domain.vercel.app

# Optional: Image Uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Maps
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

---

## Database Setup for Production

### Important: Schema Compatibility
The current `prisma/schema.prisma` is configured to work with **both SQLite and PostgreSQL**.

When deploying to Vercel with PostgreSQL:
1. Set `DATABASE_PROVIDER=postgresql` in Vercel environment variables
2. Run: `DATABASE_URL="your-db-url" npx prisma migrate deploy`
3. This applies all pending migrations to PostgreSQL

### Generate Sample Data in Production
```bash
DATABASE_URL="your-db-url" node prisma/seed.js
```

---

## Troubleshooting

### Issue: "DATABASE_PROVIDER not found"
**Solution:** Add `DATABASE_PROVIDER=postgresql` to your Vercel environment variables

### Issue: "Connection refused" on first deploy
**Solution:** Vercel might cache old builds. Do a full rebuild:
1. Go to Vercel Dashboard
2. Your Project → Settings → Git
3. Click "Redeploy" (not Deploy, but Redeploy)

### Issue: "Migration can't run on Vercel"
**Solution:** Use a Vercel Function to run migrations:

Create `api/migrate.js`:
```javascript
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  if (req.headers['x-migration-secret'] !== process.env.MIGRATION_SECRET) {
    return res.status(401).send('Unauthorized');
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe('SELECT 1');
    res.status(200).json({ success: true, message: 'Database connected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await prisma.$disconnect();
  }
}
```

Then call from your deployment:
```bash
curl -X POST https://your-domain.vercel.app/api/migrate \
  -H "x-migration-secret: your-secret"
```

---

## Local Development (After Cloning)

```bash
# Install dependencies
npm install

# Create .env with local SQLite
echo 'DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret
CLIENT_URL=http://localhost:5000' > .env

# Run migrations
npx prisma migrate dev --name init

# Seed test data
npx prisma db seed

# Start server
npm run dev
```

---

## Alternative Deployment Options

### Option 1: Railway
1. Go to [https://railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Railway auto-detects Node.js
4. Add PostgreSQL addon
5. No additional configuration needed

### Option 2: Render.com
1. Go to [https://render.com](https://render.com)
2. Create Web Service from GitHub
3. Set Build Command: `npm install && npx prisma migrate deploy`
4. Set Start Command: `npm start`
5. Render handles PostgreSQL setup

### Option 3: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create foodbridge-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

---

## Production Checklist

- [ ] Changed `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Set `CLIENT_URL` to actual domain
- [ ] Database is PostgreSQL (not SQLite)
- [ ] Database migrations applied
- [ ] Test login works: `curl -X POST https://your-domain/api/auth/login -d "..."`
- [ ] Test protected endpoint: `curl -X GET https://your-domain/api/food/my/listings -H "Authorization: Bearer TOKEN"`
- [ ] CORS configured for production domain
- [ ] Cloudinary API keys added (if using image uploads)

---

## Monitoring & Logs

### View Vercel Logs
```bash
vercel logs
```

### Check Database Connection
```bash
npx prisma studio --url="$DATABASE_URL"
```

### Monitor Server Health
```bash
curl https://your-domain.vercel.app/health
```

---

## Rollback

If deployment fails:
```bash
vercel rollback
```

---

**Questions?** Check the main [README.md](./README.md) or contact support.
