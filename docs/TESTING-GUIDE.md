# Testing Guide - GitHub Codespaces

This guide walks through testing the member portal in GitHub Codespaces.

## Prerequisites Checklist

- [ ] Codespace is running
- [ ] Ports 3000 and 5432 are forwarded (automatic)
- [ ] `.env` file exists with all required variables
- [ ] Dependencies are installed (`npm install`)
- [ ] Database migrations are applied (`npm run db:push`)

## Step-by-Step Test Flow

### 1. Setup Environment

```bash
# Verify you're in the right directory
pwd
# Should show: /workspaces/member-portal

# Check if dependencies are installed
ls node_modules/.bin/next
# Should show: node_modules/.bin/next

# If not, install dependencies
npm install
```

### 2. Configure Baserow API Key

You need a Baserow API token. Get it from:

1. Go to: https://baserow-production-9f1c.up.railway.app
2. Log in
3. Go to Settings → API tokens
4. Create a token with access to "Core Functions" workspace
5. Copy the token

Add to `.env`:
```bash
BASEROW_API_KEY=your_token_here
```

### 3. Setup Test Member in Baserow

Before testing registration, ensure you have a test member:

1. Go to Baserow → Core Functions → Members table
2. Find or create a member with:
   - **Email**: A test email you'll use (e.g., `test@example.com`)
   - **Member Status**: Set to "Active" (this is required!)
   - **Portal ID**: Should be empty/null (we'll populate this during registration)
   - **Name**: Any name
   - **Phone #**: Optional phone number

**Critical**: The member MUST have "Member Status" = "Active" to register.

### 4. Run Database Migrations

```bash
# Generate migration for the new baserowMemberId field
npm run db:generate

# Apply to database
npm run db:push
```

You should see output like:
```
✓ Applying migrations...
✓ Done!
```

### 5. Start Development Server

```bash
npm run dev
```

Wait for:
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

### 6. Access the Application

In Codespaces, you'll see a notification: "Your application running on port 3000 is available."

Click **"Open in Browser"** or go to the Ports tab and click the local address for port 3000.

### 7. Test Registration Flow

#### Test Case 1: Successful Registration

1. **Navigate to home page**
   - Should see "Member Portal" heading
   - Should see Google sign-in button (from existing AuthSection)

2. **Access registration** (if not already on the page)
   - The exact registration flow depends on your Better Auth setup
   - You might need to add a registration form or use the Better Auth default UI

   **Note**: I see the current implementation has email/password enabled in auth.ts, but we need to verify there's a sign-up UI. Let me check:

3. **Enter credentials:**
   - Email: The email from your Baserow test member (e.g., `test@example.com`)
   - Password: Create a password (e.g., `TestPassword123!`)
   - Submit

4. **Expected behavior:**
   - Registration succeeds
   - User is created in Postgres with `baserowMemberId` set
   - Baserow member's `Portal ID` is updated with Postgres user ID
   - User is automatically logged in
   - "View Profile" button appears

5. **Verify the link:**

   **In Postgres (via docker):**
   ```bash
   docker exec -it member-portal-db-1 psql -U postgres -d postgres
   # Then run:
   SELECT id, email, "baserow_member_id" FROM "user";
   ```

   Should show your user with a baserow_member_id value.

   **In Baserow:**
   - Go to Members table
   - Find your test member
   - "Portal ID" field should now contain the Postgres user ID

#### Test Case 2: View Profile

1. **Click "View Profile" button**
   - Should navigate to `/profile`

2. **Verify profile displays:**
   - ✅ Member name from Baserow
   - ✅ Email address
   - ✅ Phone number (if set in Baserow)
   - ✅ Member status badge (should show "Active" in green)
   - ✅ Member ID

3. **Check debug info (development only):**
   - At bottom of page, should see JSON with:
     - userId (Postgres ID)
     - baserowMemberId
     - Full member data from Baserow

#### Test Case 3: Inactive Member (Should Fail)

1. **Create another test member in Baserow:**
   - Email: `inactive@example.com`
   - Member Status: "Inactive"

2. **Try to register with this email**
   - Should see error: "Your member status is 'Inactive'. Only active members can register."

3. **Expected behavior:**
   - Registration blocked
   - No user created in Postgres
   - No Portal ID added to Baserow

#### Test Case 4: Non-existent Email (Should Fail)

1. **Try to register with email not in Baserow:**
   - Email: `nonexistent@example.com`
   - Password: anything

2. **Expected behavior:**
   - Should see error: "No member record found with this email address. Please contact support."

#### Test Case 5: Duplicate Registration (Should Fail)

1. **Log out** (click Sign Out)

2. **Try to register again with the same email from Test Case 1**

3. **Expected behavior:**
   - Should see error: "An account already exists for this email. Please try logging in or contact support."

### 8. Check Console Logs

The terminal running `npm run dev` should show logs like:

```
[Auth] Checking member eligibility for: test@example.com
[Auth] Member test@example.com is eligible for registration
[Auth] Linking user abc123 to Baserow member 456
[Auth] Successfully linked user abc123 to member 456
```

### 9. Test Login/Logout

1. **Click "Sign Out"**
   - Should return to home page
   - "View Profile" button disappears

2. **Sign in again:**
   - Use the same email/password from registration
   - Should log in successfully
   - "View Profile" button reappears

3. **Access profile:**
   - Should still show all member data

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Failed

```bash
# Check if postgres container is running
docker ps | grep postgres

# If not running, start it
docker-compose -f .devcontainer/docker-compose.yml up -d

# Check connection
docker exec -it member-portal-db-1 psql -U postgres -c "SELECT 1"
```

### Baserow API Error

1. **Check API key in .env**
   ```bash
   grep BASEROW_API_KEY .env
   ```

2. **Test API key manually:**
   ```bash
   curl -H "Authorization: Token YOUR_KEY" \
     https://baserow-production-9f1c.up.railway.app/api/database/tables/
   ```

   Should return JSON with tables list, not an error.

3. **Check Baserow is accessible:**
   ```bash
   curl -I https://baserow-production-9f1c.up.railway.app
   ```

   Should return 200 OK or redirect.

### Registration Hook Errors

Check the terminal logs for specific error messages:

- "No member record found" → Member doesn't exist in Baserow
- "Member status is..." → Check member's status in Baserow
- "Account already exists" → Check if Portal ID is already set
- "Failed to link user to Baserow" → Check API key permissions

## Database Inspection Commands

### View All Users (Postgres)

```bash
docker exec -it member-portal-db-1 psql -U postgres -d postgres -c \
  "SELECT id, email, name, baserow_member_id FROM \"user\";"
```

### View User Details

```bash
docker exec -it member-portal-db-1 psql -U postgres -d postgres -c \
  "SELECT * FROM \"user\" WHERE email = 'test@example.com';"
```

### Reset a User's Portal Link

If you need to test registration again:

```bash
# Clear Portal ID in Baserow (manually via UI)

# Delete user from Postgres
docker exec -it member-portal-db-1 psql -U postgres -d postgres -c \
  "DELETE FROM \"user\" WHERE email = 'test@example.com';"
```

## Success Criteria

All these should work:

- [x] Active member can register
- [x] User and member are linked bidirectionally
- [x] Profile page shows correct data from Baserow
- [x] Inactive members cannot register
- [x] Non-existent emails cannot register
- [x] Duplicate registrations are blocked
- [x] Login/logout works
- [x] Profile persists across sessions

## Next Steps After Testing

Once Phase 1 is working:

1. **Deploy to Railway** - Push to GitHub, Railway auto-deploys
2. **Test in production** - Verify with Railway database
3. **Move to Phase 2** - Add more features (events, deals, profile editing)

## Quick Reference

```bash
# Start dev server
npm run dev

# Database operations
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
npm run db:studio    # Open Drizzle Studio (GUI)

# Baserow operations
npm run baserow:get-fields  # Fetch field IDs

# Docker operations
docker ps                    # List containers
docker logs member-portal-db-1  # View database logs
docker-compose -f .devcontainer/docker-compose.yml restart  # Restart services
```
