# Quick Reference Guide

Quick reference for common tasks and patterns in the member portal.

## Key Principles

1. **Postgres = Auth Only** - No business data
2. **Baserow = All Data** - Single source of truth
3. **Use MCP Server** - Don't guess schemas
4. **No Caching** - Direct reads/writes
5. **Move Fast** - Ship it!

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production

# Database (Postgres auth only)
npm run db:push      # Apply schema changes
npm run db:studio    # Open database GUI

# Git
git checkout -b feature/name    # New branch
git commit -m "feat: message"   # Commit
git push origin feature/name    # Push
```

---

## Environment Variables

```bash
# .env
BETTER_AUTH_SECRET=<openssl rand -base64 48>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
BASEROW_API_KEY=<your-key>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
```

---

## Code Patterns

### Server Component (Data Fetching)

```typescript
// app/(portal)/profile/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <div>Welcome {session?.user?.name}!</div>;
}
```

### Client Component (Interactive)

```typescript
// components/profile/profile-form.tsx
'use client';

import { useState } from 'react';

export function ProfileForm({ data }) {
  const [value, setValue] = useState(data);

  const handleSave = async () => {
    await fetch('/api/baserow/members/123', {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### API Route (Baserow Proxy)

```typescript
// app/api/baserow/members/[id]/route.ts
import { auth } from '@/lib/auth';
import { baserowFetch } from '@/lib/baserow/client';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch from Baserow
  const member = await baserowFetch(`/api/database/rows/table/${tableId}/${params.id}/`);

  // 3. Return
  return NextResponse.json(member);
}
```

---

## Baserow Operations

### Use MCP Server First!

**Always** use MCP server to query schema. Don't guess field names.

### Fetch Data

```typescript
// lib/baserow/client.ts
import { BASEROW_API_URL, BASEROW_API_KEY } from './config';

export async function baserowFetch(endpoint: string, options = {}) {
  const response = await fetch(`${BASEROW_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error('Baserow error');
  return response.json();
}
```

### Common Endpoints

```typescript
// Get all rows
const rows = await baserowFetch('/api/database/rows/table/TABLE_ID/');

// Get single row
const row = await baserowFetch('/api/database/rows/table/TABLE_ID/ROW_ID/');

// Create row
const newRow = await baserowFetch('/api/database/rows/table/TABLE_ID/', {
  method: 'POST',
  body: JSON.stringify({ field_123: 'value' }),
});

// Update row
const updated = await baserowFetch('/api/database/rows/table/TABLE_ID/ROW_ID/', {
  method: 'PATCH',
  body: JSON.stringify({ field_123: 'new value' }),
});

// Search
const results = await baserowFetch('/api/database/rows/table/TABLE_ID/?search=query');
```

---

## Authentication

### Check Session (Server)

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// In Server Component
const session = await auth.api.getSession({ headers: await headers() });

// In API Route
const session = await auth.api.getSession({ headers: req.headers });
```

### Check Session (Client)

```typescript
'use client';
import { useSession } from '@/lib/auth-client';

export function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello {session.user.name}!</div>;
}
```

---

## Database (Postgres - Auth Only)

```typescript
import { db } from '@/lib/db/client';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Find user
const currentUser = await db.query.user.findFirst({
  where: eq(user.id, userId),
});

// Update user (link to Baserow)
await db.update(user)
  .set({ baserowMemberId: memberId })
  .where(eq(user.id, userId));
```

---

## shadcn Components

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

---

## Styling Patterns

```typescript
// Layout container
<div className="container mx-auto px-4 py-8">
  {children}
</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>

// Flex
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## File Structure

```
app/
  (auth)/
    login/page.tsx           # Login page
  (portal)/
    home/page.tsx            # Home dashboard
    profile/page.tsx         # Profile page
  api/
    auth/[...all]/route.ts   # Better Auth
    baserow/
      members/[id]/route.ts  # Member API

components/
  ui/                        # shadcn components
  auth/                      # Auth components
  portal/                    # Portal layout

lib/
  auth.ts                    # Auth config
  db/
    client.ts                # Drizzle client
    schema/
      auth-schema.ts         # Auth tables
  baserow/
    client.ts                # Baserow fetch wrapper
    config.ts                # API URL and key
```

---

## Common Tasks

### Add New Page

1. Create `app/(portal)/new-page/page.tsx`
2. Add link in `components/portal/nav.tsx`
3. Create API route if needed

### Add Baserow Table

1. Create table in Baserow UI
2. Use MCP server to query schema
3. Create API proxy route
4. Build UI components

### Update Styles

- Use Tailwind classes
- Use shadcn components
- Keep it simple

---

## Troubleshooting

```bash
# Dev server won't start
rm -rf .next
npm install
npm run dev

# Database issues
npm run db:studio  # Check connection

# Baserow API errors
curl -H "Authorization: Token YOUR_KEY" \
  https://api.baserow.io/api/user/
```

---

## Testing Checklist

Before deploying:
- [ ] Can log in
- [ ] Pages load without errors
- [ ] Can save data to Baserow
- [ ] Looks professional
- [ ] Works on mobile (basic)

---

## What to Skip (MVP)

- ❌ Caching
- ❌ Optimization
- ❌ Advanced features
- ❌ Automated tests
- ❌ Fancy animations
- ❌ Complex error handling

**Get it working. Ship it. Iterate later.**

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Baserow API](https://api.baserow.io/api/redoc/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Remember: Move fast. Use MCP server. Ship it! 🚀**
