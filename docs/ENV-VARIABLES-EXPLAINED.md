# Environment Variables - Complete Explanation

This document answers all your environment variable questions in detail.

## Quick Summary

### 3 Environments to Configure

1. **Local Development** → `.env` file (already configured ✅)
2. **Railway Production** → Railway Dashboard Variables
3. **Railway Build** → Some vars needed during build (handled automatically)

### Which Variables Go Where

| Variable | Local (.env) | Railway | Value Type |
|----------|--------------|---------|------------|
| `BETTER_AUTH_SECRET` | ✅ Set (current) | ✅ Set (NEW value) | **Different** |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `${{RAILWAY_PUBLIC_DOMAIN}}` | **Different** |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://localhost:3000` | `${{RAILWAY_PUBLIC_DOMAIN}}` | **Different** |
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/postgres` | **Auto-provided** | **Different** |
| `BASEROW_API_URL` | `https://baserow-production...` | Same value | **Same** |
| `BASEROW_API_KEY` | `nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d` | Same value | **Same** |

## Detailed Explanation

### 1. BETTER_AUTH_SECRET

**What it does:** Encrypts session tokens and cookies for authentication security.

**Local Development:**
```bash
BETTER_AUTH_SECRET=Kg6cb73GttZ4D+eIKLYKzx/hCmLTrpVZnLoifW8IpI2x89upgjdmTS1zZ5xggxEa
```

**Railway Production:**
```bash
# Generate a NEW secret - DO NOT reuse local secret!
# Run this command on your machine:
openssl rand -base64 48

# Example output (yours will be different):
BETTER_AUTH_SECRET=XyZ789aBc012dEf345GhI678jKl901MnO234pQr567StU890vWx123YzA456BcD789

# Paste the NEW value into Railway Dashboard → Variables
```

**Why different values?**
- Local secret is for testing only
- Production needs a different, secure secret
- If local secret leaks, production is still secure
- Best security practice: separate secrets per environment

**Where to set:**
- Local: `.env` file (already set ✅)
- Railway: Dashboard → Service → Variables → Add Variable

---

### 2. BETTER_AUTH_URL

**What it does:** Tells Better Auth where your backend API endpoints are located.

**Local Development:**
```bash
BETTER_AUTH_URL=http://localhost:3000
```
- Your dev server runs at `localhost:3000`
- Auth endpoints are at `http://localhost:3000/api/auth/*`

**Railway Production:**
```bash
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**What is `${{RAILWAY_PUBLIC_DOMAIN}}`?**

This is a **Railway template variable** that automatically becomes your app's URL.

**How it works:**
1. You deploy to Railway
2. Railway assigns a domain: `member-portal-production.up.railway.app`
3. The `${{RAILWAY_PUBLIC_DOMAIN}}` variable **automatically becomes**: `https://member-portal-production.up.railway.app`
4. You don't need to hardcode it!

**To find your actual Railway domain:**
1. Go to Railway Dashboard
2. Click your service
3. Settings → Domains
4. Click "Generate Domain" (if you don't have one)
5. Copy the domain (e.g., `member-portal-production.up.railway.app`)

**Where to set:**
- Local: `.env` file → `http://localhost:3000` (already set ✅)
- Railway: Dashboard → Variables → `${{RAILWAY_PUBLIC_DOMAIN}}` (template variable, not literal URL)

---

### 3. NEXT_PUBLIC_BETTER_AUTH_URL

**What it does:** Same as `BETTER_AUTH_URL`, but available in the browser (client-side).

**Why the `NEXT_PUBLIC_` prefix?**

Next.js convention:
- Variables **without** `NEXT_PUBLIC_`: Only available on server
- Variables **with** `NEXT_PUBLIC_`: Available in browser JavaScript

**Must match BETTER_AUTH_URL!**

**Local Development:**
```bash
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

**Railway Production:**
```bash
NEXT_PUBLIC_BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**Where to set:**
- Local: `.env` file (already set ✅)
- Railway: Dashboard → Variables → `${{RAILWAY_PUBLIC_DOMAIN}}`

---

### 4. DATABASE_URL

**What it does:** Connection string for PostgreSQL database.

**Local Development:**
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
```

**Breakdown:**
```
postgresql://  ← Protocol
postgres       ← Username
:postgres      ← Password (after colon)
@db            ← Hostname (Docker service name from docker-compose.yml)
:5432          ← Port (default Postgres port)
/postgres      ← Database name
```

**Railway Production:**

**⚠️ DO NOT SET THIS MANUALLY IN RAILWAY**

Railway **automatically provides** this when you add a Postgres service.

**How Railway handles it:**
1. You add Postgres service to your project
2. Railway creates a database
3. Railway automatically injects `DATABASE_URL` into your app
4. Your app reads it via `process.env.DATABASE_URL`

**Railway's auto-generated URL looks like:**
```bash
DATABASE_URL=postgresql://postgres:abc123xyz@postgres.railway.internal:5432/railway
```

**Where to find it in Railway:**
1. Click on your **Postgres service** (not your app)
2. Click "Connect" tab
3. See "DATABASE_URL" connection string

**Where to set:**
- Local: `.env` file (already set ✅)
- Railway: **Auto-provided - don't set!** (Railway injects it automatically)

**How to verify in Railway:**
1. Go to your **app service** (not Postgres)
2. Click "Variables" tab
3. Look for `DATABASE_URL` with a **🔒 lock icon**
4. Lock icon = auto-provided by Railway
5. If you don't see it, link your Postgres service to your app

---

### 5. BASEROW_API_URL

**What it does:** Base URL for your Baserow API instance.

**Both Environments (Same Value):**
```bash
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
```

**Why the same?**
- You have ONE Baserow instance
- Both local dev and production use the same Baserow
- Single source of truth for all member data

**Where to set:**
- Local: `.env` file (already set ✅)
- Railway: Dashboard → Variables → Same value

---

### 6. BASEROW_API_KEY

**What it does:** API token to authenticate with Baserow.

**Both Environments (Same Value):**
```bash
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

**Why the same?**
- Single Baserow instance = single API key
- Same permissions for both environments
- Simplicity

**Where to set:**
- Local: `.env` file (already set ✅)
- Railway: Dashboard → Variables → Same value

**How to get/verify:**
1. Go to: https://baserow-production-9f1c.up.railway.app
2. Login → Settings → API tokens
3. Find your token or create new one
4. Ensure it has access to "Core Functions" workspace

---

## Railway Step-by-Step Setup

### Step 1: Generate Production Auth Secret

On your local machine (or Codespaces terminal):

```bash
openssl rand -base64 48
```

Copy the output (example):
```
XyZ789aBc012dEf345GhI678jKl901MnO234pQr567StU890vWx123YzA456BcD789
```

### Step 2: Set Variables in Railway

Go to: Railway Dashboard → Your Project → App Service → Variables

Add these **exactly**:

```bash
BETTER_AUTH_SECRET=<paste-your-generated-secret-here>
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

**Important:**
- Type `${{RAILWAY_PUBLIC_DOMAIN}}` literally (with double curly braces)
- Don't replace it with your actual domain
- Railway will substitute it automatically

### Step 3: Add Postgres Service

1. In Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway creates database and links it
4. `DATABASE_URL` is automatically added (check Variables tab for 🔒 icon)

### Step 4: Deploy

Push to GitHub:
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

Railway auto-deploys!

## File Structure

### `.env` (Local Only - Not Committed)

Location: `/workspaces/member-portal/.env`

```bash
# Already configured ✅
BETTER_AUTH_SECRET=Kg6cb73GttZ4D+eIKLYKzx/hCmLTrpVZnLoifW8IpI2x89upgjdmTS1zZ5xggxEa
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

### `.env.sample` (Template - Committed to Git)

Location: `/workspaces/member-portal/.env.sample`

Purpose: Template for new developers (no secret values)

```bash
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
# ... etc
```

### `.env.local` (Optional - Not Used)

We're not using this file. Next.js supports it, but we use `.env` for simplicity.

### Railway Variables (Production - Web Dashboard)

Location: Railway.app → Project → Service → Variables

**Never in a file!** Managed entirely through Railway web interface.

## Common Mistakes to Avoid

### ❌ Mistake 1: Hardcoding Railway Domain

**Wrong:**
```bash
BETTER_AUTH_URL=https://member-portal-production.up.railway.app
```

**Right:**
```bash
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**Why?** Railway domains can change, custom domains can be added. Template variable adapts automatically.

### ❌ Mistake 2: Reusing Local Secrets in Production

**Wrong:**
```bash
# Using same secret in Railway as local .env
BETTER_AUTH_SECRET=Kg6cb73GttZ4D+eIKLYKzx/hCmLTrpVZnLoifW8IpI2x89upgjdmTS1zZ5xggxEa
```

**Right:**
```bash
# Generate NEW secret for Railway
BETTER_AUTH_SECRET=<different-secret-generated-with-openssl>
```

**Why?** Security isolation. If local secret leaks, production is safe.

### ❌ Mistake 3: Manually Setting DATABASE_URL in Railway

**Wrong:**
```bash
# Manually adding DATABASE_URL in Railway Variables
DATABASE_URL=postgresql://...
```

**Right:**
```bash
# Don't set it! Railway auto-provides it when you add Postgres service
# Just verify it appears with 🔒 lock icon in Variables tab
```

**Why?** Railway manages database credentials automatically. Manual setup can break when database restarts.

### ❌ Mistake 4: Different Baserow URLs/Keys

**Wrong:**
```bash
# Local
BASEROW_API_KEY=one_key

# Railway
BASEROW_API_KEY=different_key
```

**Right:**
```bash
# Both environments use SAME key
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

**Why?** Single Baserow instance. Using different keys can cause permission issues.

## Verification Checklist

### Local Development

- [x] `.env` file exists
- [x] `BETTER_AUTH_SECRET` is set (random string)
- [x] `BETTER_AUTH_URL=http://localhost:3000`
- [x] `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000`
- [x] `DATABASE_URL` points to Docker postgres
- [x] `BASEROW_API_KEY` is set (from Baserow)
- [x] Can run `npm run dev` successfully

### Railway Production

- [ ] Generated NEW `BETTER_AUTH_SECRET` (different from local)
- [ ] Set `BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}`
- [ ] Set `NEXT_PUBLIC_BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}`
- [ ] Added Postgres service (DATABASE_URL auto-provided)
- [ ] Set `BASEROW_API_URL` (same as local)
- [ ] Set `BASEROW_API_KEY` (same as local)
- [ ] Pushed to GitHub
- [ ] Railway auto-deployed successfully
- [ ] Can access app at Railway domain
- [ ] Registration/login works

## Quick Reference

### Generate Production Secret

```bash
openssl rand -base64 48
```

### Railway Template Variables

```bash
${{RAILWAY_PUBLIC_DOMAIN}}  # Your app's URL (auto-substituted)
```

### Check DATABASE_URL in Railway

1. App Service → Variables tab
2. Look for `DATABASE_URL` with 🔒 lock icon
3. If missing: Postgres Service → Connect → Link to app

### Environment Variables for Railway

```bash
BETTER_AUTH_SECRET=<generated-new-secret>
BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

(DATABASE_URL is auto-provided - don't add manually)

---

**For full Railway deployment guide:** See [RAILWAY-DEPLOYMENT.md](./RAILWAY-DEPLOYMENT.md)
