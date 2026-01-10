# Railway Deployment Guide

Complete guide for deploying the Member Portal to Railway.

## Overview

Railway is a platform that auto-deploys from GitHub. When you push to GitHub:
1. Railway detects the push
2. Runs `npm install` and `npm run build`
3. Deploys the built app
4. Makes it available at `https://your-app.up.railway.app`

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repo**: Push this code to GitHub
3. **Baserow API Key**: Already have it (in `.env`)

## Step-by-Step Setup

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your member-portal repository
5. Railway will create the project

### 2. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically creates a Postgres database
4. **Important**: Railway will automatically inject `DATABASE_URL` into your app
   - You DON'T need to set this manually
   - Railway handles the connection between app and database

### 3. Configure Environment Variables

Click on your app service → "Variables" tab

Add these **exactly as shown** (replace placeholders):

#### Required Variables

```bash
# =============================================================================
# Auth Configuration
# =============================================================================

# Generate a NEW secret for production (don't reuse local one!)
# Run locally: openssl rand -base64 48
# Then paste the output here
BETTER_AUTH_SECRET=<GENERATE_NEW_SECRET_HERE>

# Your Railway app URL (Railway provides this)
# Format: https://your-app-name.up.railway.app
# Get it from: Settings → Domains → Generate Domain
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Same as above - this makes it available to browser
NEXT_PUBLIC_BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# =============================================================================
# Baserow Configuration
# =============================================================================

# Your Baserow instance URL (same as local)
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app

# Your Baserow API token (same as local)
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d

# =============================================================================
# Database Configuration
# =============================================================================

# DATABASE_URL is automatically provided by Railway when you add Postgres
# DO NOT set this manually - Railway injects it automatically
# If you need to see it: Settings → Variables → DATABASE_URL (auto-provided)

# =============================================================================
# Optional: Google OAuth
# =============================================================================

# Only if you want Google login (optional for now)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

### 4. Understanding Railway Variables

#### `${{RAILWAY_PUBLIC_DOMAIN}}`

This is a **Railway template variable** that automatically becomes your app's URL.

**How it works:**
1. Railway assigns your app a domain (e.g., `member-portal-production.up.railway.app`)
2. The `${{RAILWAY_PUBLIC_DOMAIN}}` variable automatically becomes that URL
3. You don't need to hardcode it

**Where to find your actual domain:**
- Project → Service → Settings → Domains
- Click "Generate Domain" if you don't have one yet

**Why use this instead of hardcoding?**
- If Railway changes your domain, the variable updates automatically
- You can use custom domains later without changing variables

#### `DATABASE_URL` (Auto-provided)

**DO NOT SET THIS MANUALLY**

When you add Postgres to your Railway project:
1. Railway creates a database
2. Railway automatically adds `DATABASE_URL` to your app's environment
3. The value is: `postgresql://user:pass@host:port/db`
4. Your app can access it via `process.env.DATABASE_URL`

**To verify it's working:**
- Go to Variables tab
- Look for `DATABASE_URL` with a lock icon 🔒
- This means it's auto-provided by Railway

### 5. Generate Production Auth Secret

**DO NOT reuse your local secret in production!**

On your local machine (or in Codespaces):

```bash
# Generate a new secret for production
openssl rand -base64 48
```

Copy the output and paste it as `BETTER_AUTH_SECRET` in Railway.

Example output:
```
XyZ123ABC456def789GHI012jkl345MNO678pqr901STU234vwx567YZA890bcd123
```

### 6. Deploy

1. **First deployment** happens automatically when you create the project
2. **Subsequent deployments** happen when you push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Railway detects the push and redeploys automatically

### 7. Run Database Migrations

After first deployment, you need to apply database migrations.

**Option 1: Railway CLI (Recommended)**

Install Railway CLI:
```bash
npm i -g @railway/cli
```

Login and run migration:
```bash
railway login
railway link  # Select your project
railway run npm run db:push
```

**Option 2: Via Railway Dashboard**

Not recommended for Drizzle migrations. Use CLI instead.

**Option 3: Add to package.json (for future deploys)**

This will auto-run migrations on each deploy:

```json
{
  "scripts": {
    "build": "npm run db:push && next build"
  }
}
```

⚠️ **Caution**: This runs migrations on every build, which can be risky in production.

### 8. Access Your App

1. Go to your Railway project
2. Click on your app service
3. Settings → Domains
4. Click your domain URL (e.g., `https://member-portal-production.up.railway.app`)

## Environment Variables Comparison

| Variable | Local (.env) | Railway (Dashboard) | Notes |
|----------|-------------|---------------------|-------|
| `BETTER_AUTH_SECRET` | Random string | **Different** random string | Generate new for production |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `${{RAILWAY_PUBLIC_DOMAIN}}` | Railway template variable |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://localhost:3000` | `${{RAILWAY_PUBLIC_DOMAIN}}` | Must match BETTER_AUTH_URL |
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/postgres` | **Auto-provided by Railway** | Don't set manually |
| `BASEROW_API_URL` | `https://baserow-production-9f1c.up.railway.app` | Same | Shared Baserow instance |
| `BASEROW_API_KEY` | `nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d` | Same | Shared API key |
| `GOOGLE_CLIENT_ID` | (optional) | (optional) | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | (optional) | (optional) | For Google OAuth |

## How DATABASE_URL Works

### Local Development

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
```

**Breakdown:**
- `postgres:postgres` - username:password (default Docker creds)
- `@db` - hostname (Docker service name from docker-compose.yml)
- `:5432` - port (default Postgres port)
- `/postgres` - database name

### Railway Production

Railway generates something like:
```bash
DATABASE_URL=postgresql://postgres:abc123xyz@postgres.railway.internal:5432/railway
```

**Breakdown:**
- `postgres:abc123xyz` - generated username:password
- `@postgres.railway.internal` - Railway's internal hostname
- `:5432` - port
- `/railway` - Railway's database name

**How to find it:**
1. Go to Railway dashboard
2. Click on your Postgres service
3. Click "Connect"
4. Copy "Database URL"

**Why it works automatically:**
- Railway injects `DATABASE_URL` into your app's environment
- Your app reads it via `process.env.DATABASE_URL`
- No manual configuration needed

## Better Auth URL Explained

### What is BETTER_AUTH_URL?

Better Auth needs to know where its API endpoints are served.

**API endpoints:**
- `/api/auth/sign-in`
- `/api/auth/sign-up`
- `/api/auth/session`
- etc.

### Local Development

```bash
BETTER_AUTH_URL=http://localhost:3000
```

When you run `npm run dev`, Next.js starts at `http://localhost:3000`, so all auth endpoints are at:
- `http://localhost:3000/api/auth/sign-in`
- `http://localhost:3000/api/auth/sign-up`
- etc.

### Railway Production

```bash
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

Railway template variable becomes: `https://your-app.up.railway.app`

So auth endpoints are at:
- `https://your-app.up.railway.app/api/auth/sign-in`
- `https://your-app.up.railway.app/api/auth/sign-up`
- etc.

### NEXT_PUBLIC_BETTER_AUTH_URL

The `NEXT_PUBLIC_` prefix makes it available in the browser.

**Why both?**
- `BETTER_AUTH_URL` - Server-side auth calls
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Client-side auth calls (from browser)

**Must be the same value** for proper functionality.

## Verification Checklist

After deploying, verify everything works:

### 1. Check Deployment

- [ ] Build succeeded (no errors in Railway logs)
- [ ] App is accessible at your Railway URL
- [ ] Domain is generated (Settings → Domains)

### 2. Check Environment Variables

- [ ] `BETTER_AUTH_SECRET` is set (different from local)
- [ ] `BETTER_AUTH_URL` = `${{RAILWAY_PUBLIC_DOMAIN}}`
- [ ] `NEXT_PUBLIC_BETTER_AUTH_URL` = `${{RAILWAY_PUBLIC_DOMAIN}}`
- [ ] `DATABASE_URL` shows auto-provided (lock icon)
- [ ] `BASEROW_API_URL` is set
- [ ] `BASEROW_API_KEY` is set

### 3. Check Database

- [ ] Postgres service is running
- [ ] Migrations were applied (`npm run db:push`)
- [ ] Tables exist (check in Railway Postgres console)

### 4. Test the App

- [ ] Home page loads
- [ ] Can see login/signup form
- [ ] Registration works with active Baserow member
- [ ] Login works
- [ ] Profile page displays data from Baserow

## Troubleshooting

### "Auth endpoints not found"

**Problem:** BETTER_AUTH_URL is wrong

**Solution:**
1. Check Railway domain: Settings → Domains
2. Update BETTER_AUTH_URL to match
3. Redeploy

### "Database connection failed"

**Problem:** DATABASE_URL not set or wrong

**Solution:**
1. Check Postgres service is running
2. Verify DATABASE_URL is auto-provided (lock icon in Variables)
3. If missing, go to Postgres service → Connect → Copy DATABASE_URL

### "Baserow API error"

**Problem:** BASEROW_API_KEY is wrong or missing

**Solution:**
1. Check key in Railway Variables
2. Test key locally first
3. Verify it has access to "Core Functions" workspace

### "Migrations not applied"

**Problem:** Database tables don't exist

**Solution:**
```bash
# Via Railway CLI
railway link
railway run npm run db:push

# Or add to build script in package.json
"build": "npm run db:push && next build"
```

## Custom Domain (Optional)

### Add Custom Domain

1. Railway project → Settings → Domains
2. Click "Custom Domain"
3. Enter your domain (e.g., `portal.yourcompany.com`)
4. Add CNAME record to your DNS:
   ```
   portal.yourcompany.com → your-app.up.railway.app
   ```
5. Wait for DNS to propagate (5-30 minutes)

### Update Environment Variables

After adding custom domain:

```bash
BETTER_AUTH_URL=https://portal.yourcompany.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://portal.yourcompany.com
```

## Monitoring & Logs

### View Logs

Railway Dashboard → Your Service → "Logs" tab

**Look for:**
- Build logs (npm install, build)
- Runtime logs (console.log, errors)
- Auth logs (`[Auth] Checking member eligibility...`)

### Common Log Messages

**Successful registration:**
```
[Auth] Checking member eligibility for: user@example.com
[Auth] Member user@example.com is eligible for registration
[Auth] Linking user abc123 to Baserow member 456
[Auth] Successfully linked user abc123 to member 456
```

**Failed registration:**
```
[Auth] Checking member eligibility for: user@example.com
Error: No member record found with this email address
```

## Environment Files Summary

### `.env` (Local Development)

- **Location:** `/workspaces/member-portal/.env`
- **Purpose:** Local development in Codespaces
- **Not committed to git** (in `.gitignore`)
- **Values:** localhost URLs, Docker database

### `.env.sample` (Template)

- **Location:** `/workspaces/member-portal/.env.sample`
- **Purpose:** Template for new developers
- **Committed to git** ✅
- **Values:** Placeholder values (no secrets)

### Railway Dashboard Variables (Production)

- **Location:** Railway website → Project → Service → Variables
- **Purpose:** Production environment
- **Not in git** (managed by Railway)
- **Values:** Production URLs, Railway database

## Quick Reference

### Generate Secrets

```bash
# For BETTER_AUTH_SECRET (production)
openssl rand -base64 48
```

### Railway CLI Commands

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run npm run db:push

# View logs
railway logs

# Open in browser
railway open
```

### Environment Variables for Railway

Copy and paste this into Railway Variables (fill in values):

```
BETTER_AUTH_SECRET=<run: openssl rand -base64 48>
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

(DATABASE_URL is auto-provided - don't add it)

---

**Next Step:** Push to GitHub, Railway will auto-deploy!
