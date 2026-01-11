# Multi-User-Type Architecture Assessment

> **Status:** Planning/Scoping
> **Date:** January 2026
> **Purpose:** Assess what's needed to support Brand Partners (and future user types) with separate portal experiences

---

## Context

The app needs to be extended to support Brand Partners as a new user type with:
- Their own login page (separate from Members)
- An entirely different portal experience/views
- Same architectural pattern: PostgreSQL auth linked to Baserow records
- Brand Partners table in Baserow (not yet created)

This pattern should also support additional user types in the future.

---

## Current Architecture

| Aspect | Current State |
|--------|---------------|
| **Auth System** | Better-Auth with PostgreSQL, single user type |
| **User-Baserow Link** | `user.baserowMemberId` ↔ `Members.Portal ID` (bidirectional) |
| **Routing** | Flat structure, no route groups, per-page auth checks |
| **Role/Permissions** | None - all authenticated users treated equally |
| **Portals** | Single member portal only |
| **Middleware** | None (authentication checked per-page) |

---

## Target Architecture

| Layer | Current | Target |
|-------|---------|--------|
| **User Types** | 1 (Members only) | N (Members, Brand Partners, future types) |
| **Login Pages** | Single `/` with login form | Separate per portal (`/member/login`, `/partner/login`) |
| **Routing** | Flat `/profile`, `/roster`, etc. | Grouped `(member)/profile`, `(partner)/dashboard` |
| **Auth Schema** | `baserowMemberId` only | `userType` + type-specific Baserow ID fields |
| **Middleware** | None (per-page checks) | Global middleware for portal routing |
| **Layouts** | Single root layout | Per-portal layouts with different nav/branding |

---

## Required Changes by Layer

### 1. Database Schema (PostgreSQL)

**New fields on `user` table:**
```
userType: string           -- 'member' | 'brand_partner' | future types
baserowBrandPartnerId: string (nullable)  -- Link to Brand Partners table
```

**Migration required:** Yes, add columns to existing user table

**Complexity:** Low - straightforward schema change

**Key file:** `lib/db/schema/auth-schema.ts`

---

### 2. Baserow Setup

**New table required:** "Brand Partners" (similar structure to Members table)
- Must include `Portal ID` field for bidirectional linking
- Core identity fields: Name, Email, Company, etc.
- Status field for eligibility checking

**Configuration changes:**
- Add table ID and field mappings to `lib/baserow/config.ts`
- Create `lib/baserow/brand-partners.ts` module (similar to `members.ts`)

**Complexity:** Low-Medium - follows existing patterns

---

### 3. Authentication System

**Current hooks assume Members table.** Need to:

1. **Modify registration flow:**
   - Accept `userType` parameter during signup
   - Route to correct Baserow table for validation
   - Store appropriate Baserow ID field based on type

2. **Create separate auth endpoints or parameters:**
   - `/api/auth/signup?type=member` vs `?type=brand_partner`
   - OR separate registration components that pass type

3. **Session enhancement:**
   - Include `userType` in session data
   - All downstream code can check `session.user.userType`

**Key file:** `lib/auth.ts` (142 lines currently)

**Complexity:** Medium - hooks need conditional logic per user type

---

### 4. Route Architecture (Major Restructure)

**Current structure:**
```
app/
  page.tsx           (home + login)
  profile/page.tsx
  roster/page.tsx
  member-hub/page.tsx
```

**Target structure using Next.js route groups:**
```
app/
  (member)/
    layout.tsx           -- Member portal layout/nav
    page.tsx             -- Member dashboard
    profile/page.tsx
    roster/page.tsx
    member-hub/page.tsx
    login/page.tsx       -- Member login
  (partner)/
    layout.tsx           -- Brand Partner layout/nav
    page.tsx             -- Partner dashboard
    profile/page.tsx
    [partner-specific pages]
    login/page.tsx       -- Partner login
  (shared)/
    -- Any truly shared pages
  api/
    -- API routes (may need type-awareness)
```

**Complexity:** Medium-High - requires moving all existing pages and updating imports

---

### 5. Middleware

**Currently:** No middleware exists

**Required:** Global middleware that:
1. Checks if user is authenticated
2. Reads `userType` from session
3. Redirects users to correct portal if they access wrong one
4. Protects portal routes from wrong user types

```typescript
// Pseudocode
if (path.startsWith('/member') && userType !== 'member') {
  redirect('/partner')  // or show error
}
```

**New file:** `middleware.ts` at project root

**Complexity:** Medium - middleware pattern is well-documented but needs careful testing

---

### 6. Components & Layouts

**Shared UI components** (`components/ui/`) - No changes needed

**Portal-specific components** need separation:
```
components/
  member/          -- Member-specific components
    layout/
    dashboard/
  partner/         -- Brand Partner components
    layout/
    dashboard/
  shared/          -- Truly shared components
```

**Complexity:** Medium - some refactoring, some new components

---

### 7. API Routes

**Options:**
1. **Shared endpoints with type awareness** - Single `/api/profile` that checks user type
2. **Separate endpoints** - `/api/member/profile` vs `/api/partner/profile`

**Recommendation:** Shared endpoints where logic overlaps, separate where it diverges significantly

**Complexity:** Low-Medium - depends on how different the data models are

---

## Potential Challenges & Risks

### Challenge 1: Migration of Existing Users
- Current members have no `userType` field
- Need migration to set `userType = 'member'` for all existing users
- **Risk:** Low - straightforward data migration

### Challenge 2: Session Schema Changes
- Better-Auth session needs to include `userType`
- May need custom session handling or adapter modification
- **Risk:** Medium - depends on Better-Auth flexibility

### Challenge 3: Testing Complexity
- Each user type needs full E2E testing
- Login flows, permissions, data access all need verification
- **Risk:** Medium - doubles testing surface area per user type

### Challenge 4: Baserow Table Sync
- Brand Partners table doesn't exist yet
- Field structure needs to be defined
- Portal ID linking pattern needs to match Members table
- **Risk:** Low - but requires coordination with Baserow admin

### Challenge 5: Component Duplication vs. Abstraction
- Similar pages across portals (profile, dashboard)
- Too much abstraction = complexity; too little = maintenance burden
- **Risk:** Medium - architecture decision needed upfront

### Challenge 6: Future User Types
- If more types are coming, pattern should be extensible
- Hard-coding `if member else partner` everywhere will cause tech debt
- **Risk:** Low if designed well, High if rushed

---

## Recommended Phasing

### Phase 1: Minimum Viable Multi-Portal
1. Add `userType` to database schema
2. Create Brand Partners table in Baserow with Portal ID link
3. Implement route groups: `(member)/` and `(partner)/`
4. Create middleware for portal routing
5. Build Partner login page + basic dashboard
6. Modify auth hooks to support both types

**This gets you:** Two working portals with separate logins, even if Partner portal is initially sparse.

### Phase 2: Full Parity
- Build out Partner-specific pages matching Member functionality
- Partner profile management
- Partner-specific data views (whatever Brand Partners need to see)

---

## Files That Will Be Modified

**Must change:**
- `lib/db/schema/auth-schema.ts` - Add userType, baserowBrandPartnerId
- `lib/auth.ts` - Multi-type registration hooks
- `lib/baserow/config.ts` - Brand Partners table config
- `drizzle/` - New migration file
- `app/` - Restructure into route groups

**New files needed:**
- `middleware.ts` - Global routing middleware
- `lib/baserow/brand-partners.ts` - Brand Partner data access
- `app/(member)/layout.tsx` - Member portal layout
- `app/(partner)/layout.tsx` - Partner portal layout
- `app/(partner)/login/page.tsx` - Partner login
- `app/(partner)/page.tsx` - Partner dashboard
- `components/partner/` directory

---

## Effort & Risk Summary

| Area | Effort | Risk |
|------|--------|------|
| Database schema | Low | Low |
| Baserow setup | Low-Medium | Low |
| Auth system changes | Medium | Medium |
| Route restructure | Medium-High | Low |
| Middleware | Medium | Medium |
| Components/UI | Medium | Low |
| Testing | Medium | Medium |

---

## Design Decisions Made

Based on scoping discussion:

1. **Separate login pages** - Each portal has its own `/login` route
2. **Emails likely unique** - But architecture treats tables separately regardless
3. **Similar complexity** - Brand Partner portal will have comparable features to Member portal

---

## Next Steps When Ready to Implement

1. Create Brand Partners table in Baserow with required fields
2. Start with database schema migration
3. Restructure routes into groups
4. Add middleware
5. Modify auth hooks
6. Build Partner portal pages incrementally
