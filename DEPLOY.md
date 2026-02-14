# HealthVault Deployment Guide (Render)

## Prerequisites
- GitHub account with this repo pushed
- Render account (free tier)

## Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `healthvault-db`
   - **Database**: `healthvault`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Instance Type**: **Free**
4. Click **Create Database**
5. **Copy the Internal Database URL** (starts with `postgres://`)

## Step 2: Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `healthvault`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Runtime**: **Node**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

## Step 3: Set Environment Variables

In the web service settings → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the Internal Database URL from Step 1 |
| `SESSION_SECRET` | Generate a random string (e.g., use `openssl rand -base64 32`) |
| `NODE_ENV` | `production` |

Click **Save Changes**

## Step 4: Deploy

Render will automatically deploy after you save the environment variables.

Monitor the deploy logs for:
- ✅ `npm install` completing
- ✅ `npm run build` completing  
- ✅ Server logs showing `serving on port XXXX`

## Step 5: Initialize Database

Once deployed, open the web service **Shell** tab and run:

```bash
npm run db:push
```

This creates the database tables and the session store table.

## Step 6: Verify

1. Click the service URL (e.g., `https://healthvault.onrender.com`)
2. You should see the login screen
3. Sign in with:
   - Username: `demo`
   - Password: `password`

## Notes

**Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- Cold starts take ~30 seconds
- 750 hours/month free compute

**Auto-Deploy:**
- Render auto-deploys on every push to `main`

**Troubleshooting:**
- Check **Logs** tab for errors
- Verify `DATABASE_URL` is set correctly
- Ensure `SESSION_SECRET` is set
- Run `npm run db:push` if you see session/database errors

## Production Checklist

Before going live with real data:

- [ ] Change demo user password or disable auto-login in auth.ts
- [ ] Set strong `SESSION_SECRET`
- [ ] Enable HTTPS (Render does this by default)
- [ ] Review CORS settings if using separate frontend
- [ ] Set up database backups (Render Postgres included in paid tier)
