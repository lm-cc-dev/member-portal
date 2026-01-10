# Implementation Plan - MVP Focus

## Goal

Get a working demo as fast as possible. Iterate and improve later.

## Approach

- Build one feature at a time
- Test as you go
- Use Baserow MCP server for schemas
- Don't optimize prematurely
- Ship it!

---

## Phase 1: Foundation (30 min)

### Task 1.1: Environment Setup

**Steps:**

1. Generate secrets:
   ```bash
   openssl rand -base64 48  # BETTER_AUTH_SECRET
   ```

2. Copy `.env.sample` to `.env`

3. Fill in `.env`:
   ```bash
   BETTER_AUTH_SECRET=<generated-secret>
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL=<railway-postgres-url>
   GOOGLE_CLIENT_ID=<optional-for-now>
   GOOGLE_CLIENT_SECRET=<optional-for-now>
   BASEROW_API_KEY=<your-baserow-key>
   ```

4. Run migrations:
   ```bash
   npm run db:push
   ```

**Done when:** `npm run dev` starts without errors

---

### Task 1.2: Add Baserow Link to User Table

**Files to modify:**
- `lib/db/schema/auth-schema.ts`

**Steps:**

1. Add baserowMemberId field to user table:
   ```typescript
   export const user = pgTable("user", {
     id: text("id").primaryKey(),
     name: text("name").notNull(),
     email: text("email").notNull().unique(),
     emailVerified: boolean("emailVerified").notNull(),
     image: text("image"),
     createdAt: timestamp("createdAt").notNull(),
     updatedAt: timestamp("updatedAt").notNull(),

     // Link to Baserow
     baserowMemberId: text("baserow_member_id"),
   });
   ```

2. Generate and run migration:
   ```bash
   npm run db:generate
   npm run db:push
   ```

**Done when:** Migration runs successfully

---

### Task 1.3: Create Baserow Client

**Files to create:**
- `lib/baserow/client.ts`
- `lib/baserow/config.ts`

**Steps:**

1. Create config file:
   ```typescript
   // lib/baserow/config.ts
   export const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://api.baserow.io';
   export const BASEROW_API_KEY = process.env.BASEROW_API_KEY;

   if (!BASEROW_API_KEY) {
     console.warn('BASEROW_API_KEY not set');
   }
   ```

2. Create simple client:
   ```typescript
   // lib/baserow/client.ts
   import { BASEROW_API_URL, BASEROW_API_KEY } from './config';

   export async function baserowFetch(endpoint: string, options: RequestInit = {}) {
     const url = `${BASEROW_API_URL}${endpoint}`;

     const response = await fetch(url, {
       ...options,
       headers: {
         'Authorization': `Token ${BASEROW_API_KEY}`,
         'Content-Type': 'application/json',
         ...options.headers,
       },
     });

     if (!response.ok) {
       throw new Error(`Baserow error: ${response.statusText}`);
     }

     return response.json();
   }
   ```

**Done when:** Can import and use baserowFetch

---

### Task 1.4: Create Middleware

**Files to create:**
- `middleware.ts`

**Steps:**

1. Create basic auth middleware:
   ```typescript
   // middleware.ts
   import { NextResponse, type NextRequest } from 'next/server';
   import { auth } from './lib/auth';

   export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;

     // Public routes
     if (pathname === '/' || pathname.startsWith('/api/auth') || pathname === '/login') {
       return NextResponse.next();
     }

     // Check auth
     const session = await auth.api.getSession({ headers: request.headers });

     if (!session?.user) {
       return NextResponse.redirect(new URL('/login', request.url));
     }

     return NextResponse.next();
   }

   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
   };
   ```

**Done when:** Unauthenticated users redirect to login

---

## Phase 2: Authentication (1 hour)

### Task 2.1: Enable Email/Password in Better Auth

**Files to modify:**
- `lib/auth.ts`

**Steps:**

1. Update Better Auth config:
   ```typescript
   export const auth = betterAuth({
     database: db,
     emailAndPassword: {
       enabled: true,
     },
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       },
     },
   });
   ```

**Done when:** Email/password auth is enabled

---

### Task 2.2: Create Login Page

**Files to create:**
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`

**Steps:**

1. Create auth layout:
   ```typescript
   // app/(auth)/layout.tsx
   export default function AuthLayout({ children }: { children: React.ReactNode }) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-neutral-50">
         {children}
       </div>
     );
   }
   ```

2. Create login page:
   ```typescript
   // app/(auth)/login/page.tsx
   import { LoginForm } from '@/components/auth/login-form';

   export default function LoginPage() {
     return (
       <div className="w-full max-w-md">
         <h1 className="text-3xl font-bold text-center mb-8">Member Portal</h1>
         <LoginForm />
       </div>
     );
   }
   ```

3. Create login form component with shadcn (use existing auth-section.tsx as reference)

**Done when:** Can see login page at /login

---

### Task 2.3: Create Simple Sign Up (If Needed)

**Optional:** For demo, you can manually create users in database or use email/password signup.

**Done when:** Can create test user

---

## Phase 3: Portal Layout (30 min)

### Task 3.1: Create Portal Layout

**Files to create:**
- `app/(portal)/layout.tsx`
- `components/portal/header.tsx`
- `components/portal/nav.tsx`

**Steps:**

1. Create simple portal layout with header and nav:
   ```typescript
   // app/(portal)/layout.tsx
   import { Header } from '@/components/portal/header';
   import { Nav } from '@/components/portal/nav';

   export default function PortalLayout({ children }: { children: React.ReactNode }) {
     return (
       <div className="min-h-screen bg-neutral-50">
         <Header />
         <div className="flex">
           <Nav />
           <main className="flex-1 p-8">
             {children}
           </main>
         </div>
       </div>
     );
   }
   ```

2. Create header with user menu
3. Create nav with links

**Done when:** Layout renders with navigation

---

## Phase 4: Home Page (30 min)

### Task 4.1: Create Basic Home Page

**Files to create:**
- `app/(portal)/home/page.tsx`

**Steps:**

1. Create simple home page:
   ```typescript
   // app/(portal)/home/page.tsx
   import { auth } from '@/lib/auth';
   import { headers } from 'next/headers';

   export default async function HomePage() {
     const session = await auth.api.getSession({ headers: await headers() });

     return (
       <div>
         <h1 className="text-3xl font-bold mb-4">
           Welcome, {session?.user?.name || 'Member'}!
         </h1>
         <p className="text-neutral-600">
           Your personalized dashboard
         </p>
       </div>
     );
   }
   ```

**Done when:** Home page shows user name

---

## Phase 5: Profile Page (1-2 hours)

### Task 5.1: Query Baserow Members via MCP

**Steps:**

1. Use MCP server to understand Members table structure
2. Create types based on actual schema
3. Don't guess field names!

**Done when:** You know the Members table structure

---

### Task 5.2: Create Profile API Route

**Files to create:**
- `app/api/baserow/members/[id]/route.ts`

**Steps:**

1. Create API route to fetch member:
   ```typescript
   // app/api/baserow/members/[id]/route.ts
   import { auth } from '@/lib/auth';
   import { baserowFetch } from '@/lib/baserow/client';
   import { NextResponse } from 'next/server';

   export async function GET(
     req: Request,
     { params }: { params: { id: string } }
   ) {
     const session = await auth.api.getSession({ headers: req.headers });

     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const memberId = params.id;
     const member = await baserowFetch(`/api/database/rows/table/MEMBERS_TABLE_ID/${memberId}/`);

     return NextResponse.json(member);
   }

   export async function PATCH(
     req: Request,
     { params }: { params: { id: string } }
   ) {
     const session = await auth.api.getSession({ headers: req.headers });

     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const body = await req.json();
     const memberId = params.id;

     const updated = await baserowFetch(
       `/api/database/rows/table/MEMBERS_TABLE_ID/${memberId}/`,
       {
         method: 'PATCH',
         body: JSON.stringify(body),
       }
     );

     return NextResponse.json(updated);
   }
   ```

**Done when:** API route can fetch/update member data

---

### Task 5.3: Create Profile Page

**Files to create:**
- `app/(portal)/profile/page.tsx`
- `components/profile/profile-form.tsx`

**Steps:**

1. Fetch member data from Baserow
2. Display in form
3. Allow editing
4. Save back to Baserow

**Done when:** Can view and edit profile

---

## Phase 6: Events Page (When Ready)

**Prerequisites:** Events table exists in Baserow

### Task 6.1: Query Events Schema via MCP

Use MCP server to understand Events table structure.

---

### Task 6.2: Create Events List Page

**Files to create:**
- `app/(portal)/events/page.tsx`
- `components/events/event-card.tsx`

**Steps:**

1. Create API route to fetch events
2. Display in grid of cards
3. Keep it simple

**Done when:** Can view events list

---

### Task 6.3: Create Event Detail Page

**Files to create:**
- `app/(portal)/events/[id]/page.tsx`

**Steps:**

1. Show event details
2. Add registration button (if needed)

**Done when:** Can view event details

---

## Phase 7: Deals Page (When Ready)

**Prerequisites:** Deals table exists in Baserow

### Similar to Events

1. Query schema via MCP
2. Create list page
3. Create detail page

---

## Phase 8: Quick Links (When Ready)

**Prerequisites:** Quick Links table exists in Baserow

### Task 8.1: Display Quick Links

**Files to create:**
- `app/(portal)/quick-links/page.tsx`

**Steps:**

1. Fetch from Baserow
2. Display as grid of cards
3. Click to open URL

**Done when:** Quick links work

---

## Testing Checklist

Before demo:

- [ ] Can log in with email/password
- [ ] Can view home page with name
- [ ] Can view profile from Baserow
- [ ] Can edit and save profile
- [ ] Navigation works
- [ ] Looks professional
- [ ] No console errors
- [ ] Works in production

## Deployment

1. Push to GitHub
2. Railway deploys automatically
3. Set environment variables in Railway
4. Test live site
5. Demo ready!

---

## What to Skip (For Now)

- ❌ Caching
- ❌ Optimization
- ❌ Advanced filters
- ❌ Search
- ❌ Analytics
- ❌ Error tracking
- ❌ Loading states (unless trivial)
- ❌ Fancy animations
- ❌ Mobile optimization (basic responsive is fine)

**Get it working first. Make it perfect later.**

## Key Reminders

1. **Use MCP server** - Don't guess Baserow schemas
2. **Postgres for auth only** - Everything else in Baserow
3. **Move fast** - Ship something working
4. **Iterate** - Perfect is the enemy of done

---

**Let's build this thing! 🚀**
