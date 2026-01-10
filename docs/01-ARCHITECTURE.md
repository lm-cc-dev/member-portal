# Architecture Documentation

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Member Portal                        │
│                   (Next.js App Router)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Login      │  │   Home       │  │   Profile    │ │
│  │   Page       │  │   Page       │  │   Page       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Events     │  │   Deals      │  │   Quick      │ │
│  │   (future)   │  │   (future)   │  │   Links      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                   API Routes Layer                       │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   /api/auth  │  │ /api/baserow │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│   PostgreSQL     │                  │   Baserow API    │
│   (Railway)      │                  │   (External)     │
├──────────────────┤                  ├──────────────────┤
│ • Users          │                  │ • Members        │
│ • Sessions       │                  │ • Events         │
│ • Accounts       │                  │ • Deals          │
│ • Verification   │                  │ • Quick Links    │
│ • Baserow Link   │                  │ • All Data       │
└──────────────────┘                  └──────────────────┘
```

## Directory Structure

```
/workspaces/member-portal/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group routes
│   │   └── login/                # Login page
│   ├── (portal)/                 # Protected portal routes
│   │   ├── home/                 # Home dashboard
│   │   ├── profile/              # Profile management
│   │   ├── events/               # Events (future)
│   │   ├── deals/                # Deals (future)
│   │   └── quick-links/          # Quick links (future)
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/        # Better Auth handler
│   │   └── baserow/              # Baserow proxy endpoints
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── ui/                       # shadcn components (atomic)
│   ├── auth/                     # Authentication components
│   ├── portal/                   # Portal layout (header, nav)
│   ├── profile/                  # Profile components
│   ├── events/                   # Event components (future)
│   └── deals/                    # Deal components (future)
│
├── lib/                          # Core libraries
│   ├── auth.ts                   # Server auth config
│   ├── auth-client.ts            # Client auth hooks
│   ├── db/                       # Database layer (Postgres only)
│   │   ├── client.ts             # Drizzle client
│   │   └── schema/               # DB schemas
│   │       └── auth-schema.ts    # Auth tables only
│   ├── baserow/                  # Baserow integration
│   │   ├── client.ts             # Simple fetch wrapper
│   │   └── config.ts             # API URL and key
│   └── utils.ts                  # Utility functions
│
├── types/                        # TypeScript types (optional)
├── middleware.ts                 # Next.js middleware (auth)
├── docs/                         # Documentation
└── public/                       # Static assets
```

## Data Architecture

### PostgreSQL (Auth Only)

**Purpose:** Authentication and session management only.

**Tables:**
- `user` - User accounts (email, password hash, baserowMemberId link)
- `session` - User sessions
- `account` - OAuth accounts (Google)
- `verification` - Email verification tokens

**That's it. No business data in Postgres.**

### Baserow (All Business Data)

**Purpose:** All member data, content, and business logic.

**Tables (use MCP server to query):**
- Members - Member profiles
- Events - Events and registrations (future)
- Deals - Investment opportunities (future)
- Quick Links - Customizable links (future)
- Content - Resources and media (future)

**Key Point:** Always use MCP server to get current schema. Don't hardcode field names.

### Data Flow

```
1. User logs in → PostgreSQL (Better Auth)
2. Check user.baserowMemberId
3. If missing, search Baserow by email → store ID
4. Fetch member data from Baserow (direct, no cache)
5. Display to user
6. On save, write directly to Baserow
7. Done!
```

**No caching. No sync. Simple.**

## API Architecture

### API Routes Structure

```
/api/auth/[...all]          # Better Auth endpoints (built-in)
/api/baserow/
  ├── members/[id]          # Get/update member by ID
  ├── events/               # List events (future)
  └── deals/                # List deals (future)
```

### Authentication Flow

```
1. User visits /login
2. Enters email/password OR clicks "Google"
3. Better Auth validates credentials
4. Session created, cookie set
5. Redirect to /home
6. Middleware checks session on protected routes
7. If valid, show page
8. If invalid, redirect to /login
```

### Baserow Proxy Pattern

**All Baserow calls go through Next.js API routes:**

```typescript
// Client → API Route → Baserow
// Never: Client → Baserow directly

// Example: app/api/baserow/members/[id]/route.ts
export async function GET(req: Request, { params }) {
  // 1. Check auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Fetch from Baserow
  const member = await baserowFetch(`/api/database/rows/table/${tableId}/${params.id}/`);

  // 3. Return to client
  return Response.json(member);
}
```

**Why proxy?**
- Keeps API key server-side
- Can add auth checks
- Can transform data if needed

## Security Architecture

### Basic Security Layers

1. **Authentication**
   - Better Auth with email/password
   - Optional Google OAuth
   - Hashed passwords (bcrypt)
   - HTTP-only session cookies

2. **Authorization**
   - Middleware checks session
   - API routes verify session
   - That's enough for MVP

3. **Data Protection**
   - HTTPS in production (Railway auto)
   - Baserow API key in env vars
   - Never exposed to client

### What We're NOT Doing (Yet)

- ❌ Advanced RBAC
- ❌ Row-level security
- ❌ Audit logging
- ❌ Rate limiting
- ❌ API key rotation
- ❌ Complex permissions

**Keep it simple. Add later if needed.**

## Performance Architecture

### No Premature Optimization

**For MVP:**
- Server Components for data fetching (built-in)
- No caching
- No complex queries
- Direct Baserow API calls
- It's fast enough!

**Later (if needed):**
- Add React Query for client state
- Add caching for frequently accessed data
- Optimize images
- Code splitting

**Rule:** Get it working first. Optimize when you see a problem.

## Deployment Architecture

### Railway Setup

```
┌─────────────────────────────────────┐
│         Railway Project             │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐   │
│  │   Next.js Service          │   │
│  │   • Port: 3000            │   │
│  │   • Auto-deploy on push   │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │   PostgreSQL Service       │   │
│  │   • Auto-provisioned       │   │
│  │   • Managed backups        │   │
│  └────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Environment Variables

Set in Railway dashboard:
- `BETTER_AUTH_SECRET`
- `DATABASE_URL` (auto-injected by Railway)
- `BASEROW_API_KEY`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)

### Deployment Flow

1. Push to GitHub
2. Railway detects changes
3. Builds Next.js app
4. Runs `npm run build`
5. Starts with `npm run start`
6. Health check passes
7. Live!

**That's it. No complex CI/CD needed.**

## Component Architecture

### Server Components (Default)

```typescript
// app/(portal)/profile/page.tsx
// Server Component - can directly fetch data
export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const member = await baserowFetch(`/api/database/rows/table/${tableId}/${memberId}/`);

  return <ProfileForm member={member} />;
}
```

### Client Components (When Needed)

```typescript
// components/profile/profile-form.tsx
'use client';

import { useState } from 'react';

export function ProfileForm({ member }) {
  const [name, setName] = useState(member.name);

  const handleSave = async () => {
    await fetch(`/api/baserow/members/${member.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  };

  return (
    <form onSubmit={handleSave}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Key Principles

1. **Postgres = Auth Only** - Don't store business data
2. **Baserow = Everything Else** - Single source of truth
3. **MCP Server = Schema** - Don't guess field names
4. **No Caching** - Direct reads/writes for MVP
5. **Simple API Routes** - Auth check + Baserow fetch
6. **Server Components** - Use by default
7. **Railway** - Easy deployment

## What's Missing (Intentionally)

These are fine to skip for MVP:

- Complex state management (Redux, Zustand)
- Advanced caching strategies
- Database connection pooling
- CDN for assets
- Image optimization service
- Monitoring/observability
- Error tracking (Sentry)
- Analytics

**Add these later when you need them.**

## File Naming Conventions

- **Pages**: `app/(group)/page-name/page.tsx`
- **Components**: `components/category/component-name.tsx`
- **API Routes**: `app/api/resource/route.ts`
- **Utilities**: `lib/utility-name.ts`

## Summary

**Simple architecture for fast development:**
- Postgres: Auth only
- Baserow: All data
- Next.js: API proxy + UI
- Railway: Hosting
- MCP: Schema source of truth

**Ship it fast. Iterate later. 🚀**
