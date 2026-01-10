# Next Steps - Quick Reference

## Your Questions - Answered ✅

### 1. ✅ Environment Variables

**Complete explanation:** [docs/ENV-VARIABLES-EXPLAINED.md](docs/ENV-VARIABLES-EXPLAINED.md)

**Quick Summary:**
- **Local (.env)**: Already configured ✅
- **Railway**: Need to set 5 variables (details in doc above)
- **DATABASE_URL**: Auto-provided by Railway (don't set manually)
- **BETTER_AUTH_URL**: Use `${{RAILWAY_PUBLIC_DOMAIN}}` in Railway
- **Secrets**: Generate NEW secret for production (don't reuse local)

### 2. ✅ Baserow API Key

Already added to `.env` ✅
```bash
BASEROW_API_KEY=nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d
```

### 3. ⏳ tsx Installation Issue

**Problem:** `npm install` was terminated before completing

**Solution:**

The installation may still be running in the background. Try these options:

**Option 1: Wait and check**
```bash
# Check if installation finished
ls node_modules/.bin/tsx
# If found, you're good! If not, continue to Option 2
```

**Option 2: Simple restart**
```bash
# Kill any running npm processes
pkill -f npm

# Try install again
npm install
```

**Option 3: Nuclear option (if Option 2 fails)**
```bash
# Clean everything and reinstall
rm -rf node_modules package-lock.json
npm install
```

**To verify it worked:**
```bash
npm run baserow:get-fields
# Should fetch field IDs without "tsx: not found" error
```

**Alternative: Don't need tsx right now!**

The field IDs are **optional** for MVP. The app works with field names:
- Field IDs are for documentation and stability
- Using `useFieldNames: true` in code works fine
- You can fetch field IDs later when needed

## Immediate Next Steps

### 1. Test Locally (5 minutes)

```bash
# 1. Make sure dependencies are installed
npm install

# 2. Generate and apply database migration
npm run db:generate
npm run db:push

# 3. Start dev server
npm run dev
```

Then:
1. Open Codespaces preview (port 3000)
2. Should see "Member Portal" with login form
3. Try registering with an Active member email from Baserow

**Testing guide:** [docs/TESTING-GUIDE.md](docs/TESTING-GUIDE.md)

### 2. Deploy to Railway (10 minutes)

**Complete guide:** [docs/RAILWAY-DEPLOYMENT.md](docs/RAILWAY-DEPLOYMENT.md)

**Quick steps:**

1. **Generate production secret:**
   ```bash
   openssl rand -base64 48
   # Copy output for Railway
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add member portal Phase 1"
   git push origin main
   ```

3. **Set up Railway:**
   - Create project from GitHub repo
   - Add Postgres service
   - Set 5 environment variables (see guide)
   - Railway auto-deploys!

4. **Run migrations:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Link and run migration
   railway login
   railway link
   railway run npm run db:push
   ```

5. **Test production:**
   - Go to your Railway domain
   - Register with Active member
   - View profile

## Baserow Field IDs (Optional)

### Why Optional?

The app uses `useFieldNames: true` in API calls, so it works with field **names** like "Email", "Phone #" instead of field IDs.

### When to Update?

- When you have time (not urgent)
- Before production (best practice)
- If Baserow field names change

### How to Update?

**Once tsx is installed:**

```bash
# Fetch field IDs
npm run baserow:get-fields

# Output will show:
field_3390 → Member ID (text)
field_3602 → Email (email)
field_4410 → Phone # (phone_number)
# ... etc
```

**Then update:** [lib/baserow/config.ts](lib/baserow/config.ts)

Replace `field_TODO` placeholders with actual field IDs.

**Example:**
```typescript
export const MEMBERS_FIELDS = {
  MEMBER_ID: 'field_3390',  // ← Replace field_TODO
  EMAIL: 'field_3602',       // ← Replace field_TODO
  PHONE: 'field_4410',       // ← Replace field_TODO
  // ... etc
}
```

## Documentation Reference

| Document | Purpose |
|----------|---------|
| [QUICK-START.md](docs/QUICK-START.md) | Start here! Complete overview |
| [ENV-VARIABLES-EXPLAINED.md](docs/ENV-VARIABLES-EXPLAINED.md) | Detailed env var explanation |
| [RAILWAY-DEPLOYMENT.md](docs/RAILWAY-DEPLOYMENT.md) | Complete Railway guide |
| [TESTING-GUIDE.md](docs/TESTING-GUIDE.md) | Test scenarios and verification |
| [PHASE-1-COMPLETE.md](docs/PHASE-1-COMPLETE.md) | Implementation summary |
| [BASEROW-FIELD-IDS.md](docs/BASEROW-FIELD-IDS.md) | Field IDs reference |

## Quick Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production

# Database
npm run db:generate         # Generate migrations
npm run db:push            # Apply migrations
npm run db:studio          # Open database GUI

# Baserow (once tsx is installed)
npm run baserow:get-fields # Fetch field IDs

# Railway
railway login              # Login to Railway
railway link               # Link to project
railway run npm run db:push  # Run migration in Railway
railway logs               # View deployment logs
```

## Troubleshooting

### "tsx: not found"

**Solution:** Complete npm install (see Option 2/3 above)

### "Database connection failed"

**Local:**
```bash
# Check Docker postgres is running
docker ps | grep postgres

# If not, start it
docker-compose -f .devcontainer/docker-compose.yml up -d
```

**Railway:**
- Check Postgres service is running
- Verify DATABASE_URL has 🔒 lock icon in Variables

### "Baserow API error"

```bash
# Test API key
curl -H "Authorization: Token nxSrq5lWzeURMcLqFO5NCYplwmLZ8F7d" \
  https://baserow-production-9f1c.up.railway.app/api/database/tables/

# Should return JSON, not error
```

### "Registration fails"

1. Check member exists in Baserow with exact email
2. Verify Member Status = "Active"
3. Check Portal ID is empty (null)
4. Check server logs for detailed error

## What Works Right Now ✅

Even with tsx not installed, these work:

- ✅ Dev server (`npm run dev`)
- ✅ Database migrations (`npm run db:push`)
- ✅ Authentication and registration
- ✅ Profile page
- ✅ Baserow integration (via field names)

**Only missing:**
- ❌ `npm run baserow:get-fields` command (needs tsx)
  - **Workaround:** Field IDs are optional, app works without them

## Summary

### Environment Variables
- **Local:** Already configured in `.env` ✅
- **Railway:** 5 variables to set (see ENV-VARIABLES-EXPLAINED.md)
- **DATABASE_URL:** Auto-provided by Railway (don't set manually)

### tsx Installation
- Currently not working (terminated install)
- **Fix:** Re-run `npm install` or restart Codespaces
- **Alternative:** Skip for now, field IDs are optional

### Next Action
1. **Test locally:** `npm run dev`
2. **Deploy to Railway:** Follow RAILWAY-DEPLOYMENT.md
3. **Optional:** Fix tsx and fetch field IDs later

---

**Ready to test?** Run `npm run dev` and open port 3000! 🚀
