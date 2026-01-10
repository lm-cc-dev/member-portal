# Quick Start Guide - Phase 1 Implementation

## Summary of Your Questions

### ✅ 1. Dev Container Setup

**Auto-install configured!** I updated [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) to:
- Auto-run `npm install` when container starts
- Forward ports 3000 (Next.js) and 5432 (Postgres)

**To verify dependencies:**
```bash
ls node_modules/.bin/next
# If missing, run: npm install
```

### ✅ 2. Environment Variables

**For Local Development (Codespaces):**

Your [.env](.env) file is ready with:
- ✅ BETTER_AUTH_SECRET (pre-generated)
- ✅ DATABASE_URL (points to docker postgres)
- ✅ BASEROW_API_URL (from your MCP config)
- ❗ BASEROW_API_KEY (you need to add this)

**To get BASEROW_API_KEY:**
1. Go to: https://baserow-production-9f1c.up.railway.app
2. Login → Settings → API tokens
3. Create token with "Core Functions" workspace access
4. Copy and paste into `.env`

**For Railway Production:**

Set these in Railway dashboard:
```bash
DATABASE_URL=<railway-auto-provides>
BETTER_AUTH_SECRET=<generate-new-secret>
BETTER_AUTH_URL=https://your-app.up.railway.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.up.railway.app
BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
BASEROW_API_KEY=<same-as-local>
```

### ✅ 3. Field IDs Explanation

**Current Status:** The config has `field_TODO` placeholders.

**Why?**
- Field **names** can change in Baserow UI ("Email" → "Email Address")
- Field **IDs** never change (field_12345 stays field_12345)
- For MVP, we use `useFieldNames: true` so it works with names

**To get actual field IDs:**
1. Add your `BASEROW_API_KEY` to `.env`
2. Run: `npm run baserow:get-fields`
3. Update [lib/baserow/config.ts](lib/baserow/config.ts) with the output

**Example output:**
```
field_12345 → Name (text)
field_12346 → Email (email)
field_12347 → Phone # (phone_number)
field_12348 → Portal ID (text)
field_12349 → Member Status (single_select)
```

**For now:** It works without field IDs because we use field names in API calls.

### ✅ 4. Implementation Checks

#### **Using shadcn?** YES! ✅

**Components used:**
- `Button` - Actions and links
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Layout
- `Input` - Form fields
- `Label` - Form labels
- `Alert` - Error messages
- Icons from `lucide-react`

**Files using shadcn:**
- [components/auth/login-form.tsx](components/auth/login-form.tsx) - New login/signup form
- [components/auth-section.tsx](components/auth-section.tsx) - Auth display
- [app/profile/page.tsx](app/profile/page.tsx) - Profile page

**40+ components available** in [components/ui/](components/ui/)

#### **Schema Management?** Drizzle ORM (NOT Prisma) ✅

**Why Drizzle?**
- ✅ Lightweight, TypeScript-first
- ✅ Better Auth has native support
- ✅ SQL-like syntax, full type safety
- ✅ Migration control (you see actual SQL)
- ✅ No extra runtime layer

**How it works:**

1. **Define schema** in TypeScript:
   ```typescript
   // lib/db/schema/auth-schema.ts
   export const user = pgTable("user", {
     id: text("id").primaryKey(),
     email: text("email").notNull().unique(),
     baserowMemberId: text("baserow_member_id"), // ← I added this
   });
   ```

2. **Generate SQL migration:**
   ```bash
   npm run db:generate
   # Creates: drizzle/0001_xyz.sql
   ```

3. **Apply to database:**
   ```bash
   npm run db:push
   ```

4. **Query with types:**
   ```typescript
   import { db } from '@/lib/db/client';
   import { user } from '@/lib/db/schema/auth-schema';
   import { eq } from 'drizzle-orm';

   const users = await db
     .select()
     .from(user)
     .where(eq(user.email, 'test@example.com'));
   ```

**Key files:**
- [drizzle.config.ts](drizzle.config.ts) - Drizzle configuration
- [lib/db/schema/auth-schema.ts](lib/db/schema/auth-schema.ts) - Schema definitions
- [lib/db/client.ts](lib/db/client.ts) - Database client
- [drizzle/](drizzle/) - Generated migrations

**Commands:**
```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:push      # Apply migrations to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Complete Test Flow for Codespaces

### Step 1: Initial Setup

```bash
# Verify dependencies
npm install

# Generate and apply database migration
npm run db:generate
npm run db:push
```

### Step 2: Configure Baserow

1. **Get API Key:**
   - Go to: https://baserow-production-9f1c.up.railway.app
   - Login → Settings → API tokens → Create token
   - Add to `.env`: `BASEROW_API_KEY=your_token_here`

2. **Create Test Member:**
   - Open Baserow → Core Functions → Members table
   - Create/find member with:
     - Email: `test@example.com` (you'll use this)
     - Member Status: **"Active"** (required!)
     - Portal ID: (leave empty)
     - Name: "Test User"
     - Phone #: "+1234567890" (optional)

### Step 3: Start Development Server

```bash
npm run dev
```

Wait for: `✓ Ready in X.Xs`

### Step 4: Open in Browser

Codespaces will show: "Your application running on port 3000 is available"

Click **"Open in Browser"** or use the Ports tab.

### Step 5: Test Registration

1. **Navigate to home page**
   - Should see "Member Portal" heading
   - Should see login/signup form

2. **Click "Need an account? Sign up"**

3. **Fill in form:**
   - Name: "Test User"
   - Email: `test@example.com` (from your Baserow member)
   - Password: `TestPassword123!`
   - Click "Create Account"

4. **Expected result:**
   - ✅ Account created
   - ✅ Automatically logged in
   - ✅ Redirected to profile page
   - ✅ Shows member data from Baserow

5. **Verify in databases:**

   **Postgres:**
   ```bash
   docker exec -it member-portal-db-1 psql -U postgres -d postgres -c \
     "SELECT id, email, baserow_member_id FROM \"user\";"
   ```
   Should show user with baserow_member_id.

   **Baserow:**
   - Check Members table
   - Your test member's "Portal ID" should now have the Postgres user ID

### Step 6: Test Profile Page

1. **Should automatically be on `/profile`**

2. **Verify displays:**
   - ✅ Name from Baserow
   - ✅ Email address
   - ✅ Phone number
   - ✅ Member Status badge (green "Active")
   - ✅ Member ID

### Step 7: Test Validation Rules

**Test 1: Inactive Member (should fail)**
```
1. Create member in Baserow: inactive@example.com, Status: "Inactive"
2. Try to register → Should see error
3. Expected: "Your member status is 'Inactive'. Only active members can register."
```

**Test 2: Non-existent Email (should fail)**
```
1. Try to register with: nonexistent@example.com
2. Expected: "No member record found with this email address."
```

**Test 3: Duplicate Registration (should fail)**
```
1. Log out
2. Try to register again with test@example.com
3. Expected: "An account already exists for this email."
```

### Step 8: Test Login/Logout

```
1. Click "Sign Out" → Returns to home
2. Enter email and password → Sign in
3. Should redirect to profile
4. Profile still shows correct data
```

## What's New Since Initial Implementation

I added a complete **login/signup form** using shadcn:

**New file:** [components/auth/login-form.tsx](components/auth/login-form.tsx)
- Beautiful form with shadcn Input, Label, Button, Alert
- Switches between login and signup mode
- Shows validation errors inline
- Loading states with spinner
- Icons for visual clarity

**Updated:** [components/auth-section.tsx](components/auth-section.tsx)
- Now uses LoginForm for unauthenticated users
- Removed Google-only auth
- Better user experience

## Architecture Summary

### Authentication Flow

```
User submits registration form
    ↓
Better Auth receives request
    ↓
[Before Hook] Validates against Baserow:
    - Member exists with email?
    - Member Status = "Active"?
    - Portal ID is empty?
    ↓
Creates user in Postgres
    ↓
[After Hook] Links records:
    - Updates Postgres user.baserowMemberId
    - Updates Baserow member Portal ID
    ↓
User is logged in
```

### Data Architecture

```
Postgres (Auth Only)
└── user table
    ├── id (primary key)
    ├── email
    ├── password (hashed)
    └── baserowMemberId → Links to Baserow

Baserow (All Business Data)
└── Members table
    ├── id (row ID)
    ├── Name
    ├── Email
    ├── Phone #
    ├── Member Status (Active/Inactive)
    ├── Portal ID → Links to Postgres
    └── ... all other member fields
```

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** Better Auth (email/password + hooks)
- **Database:** PostgreSQL (Drizzle ORM)
- **Data Store:** Baserow (via REST API)
- **UI:** shadcn/ui + Tailwind CSS
- **Icons:** lucide-react
- **Deployment:** Railway
- **Dev:** Docker (postgres), GitHub Codespaces

## Key Files Reference

### Authentication
- [lib/auth.ts](lib/auth.ts) - Better Auth config with Baserow hooks
- [lib/auth-client.ts](lib/auth-client.ts) - Client-side auth hooks
- [components/auth/login-form.tsx](components/auth/login-form.tsx) - Login/signup form
- [components/auth-section.tsx](components/auth-section.tsx) - Auth display

### Baserow Integration
- [lib/baserow/config.ts](lib/baserow/config.ts) - Field IDs and configuration
- [lib/baserow/client.ts](lib/baserow/client.ts) - API client
- [lib/baserow/members.ts](lib/baserow/members.ts) - Member operations

### Database
- [lib/db/schema/auth-schema.ts](lib/db/schema/auth-schema.ts) - Postgres schema
- [lib/db/client.ts](lib/db/client.ts) - Drizzle client
- [drizzle.config.ts](drizzle.config.ts) - Drizzle configuration

### Pages & API
- [app/page.tsx](app/page.tsx) - Home page
- [app/profile/page.tsx](app/profile/page.tsx) - Profile page
- [app/api/member/route.ts](app/api/member/route.ts) - Member API

### Documentation
- [docs/TESTING-GUIDE.md](docs/TESTING-GUIDE.md) - Complete testing guide
- [docs/PHASE-1-COMPLETE.md](docs/PHASE-1-COMPLETE.md) - Implementation summary
- [docs/BASEROW-FIELD-IDS.md](docs/BASEROW-FIELD-IDS.md) - Field IDs reference

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Dependencies missing | `npm install` |
| Database not connected | `docker-compose -f .devcontainer/docker-compose.yml up -d` |
| Migration not applied | `npm run db:generate && npm run db:push` |
| Baserow API error | Check BASEROW_API_KEY in `.env` |
| Registration fails | Check member exists with "Active" status |
| Profile page empty | Check user.baserowMemberId is set |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |

## Next Steps

1. ✅ **Test everything** using the flow above
2. 🚀 **Deploy to Railway** (push to GitHub)
3. 🎨 **Add more profile fields** (capital info, investment preferences)
4. 📅 **Phase 2: Events system**
5. 💼 **Phase 3: Deals system**

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Apply migrations
npm run db:studio        # Open Drizzle Studio GUI

# Baserow
npm run baserow:get-fields  # Fetch field IDs

# Docker
docker ps                                          # List containers
docker logs member-portal-db-1                     # View logs
docker exec -it member-portal-db-1 psql -U postgres  # Access Postgres
```

---

**You're all set!** Start with `npm run dev` and follow the test flow. 🚀
