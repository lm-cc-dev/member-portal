# Development Workflow

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Git installed
- Railway account (for deployment)
- Baserow account and API key
- Google OAuth credentials (optional)

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd member-portal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.sample .env
   ```

   Edit `.env` and fill in:
   ```bash
   # Generate secret: openssl rand -base64 48
   BETTER_AUTH_SECRET=<random-string>

   # Local development
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

   # Database (use Railway PostgreSQL URL)
   DATABASE_URL=postgresql://user:pass@host:port/db

   # Baserow
   BASEROW_API_KEY=<your-api-key>

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=<your-client-id>
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   ```

4. **Set Up Database**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Development Environment

### GitHub Codespaces

The project works great in GitHub Codespaces:
- Pre-configured environment
- Automatic port forwarding
- VS Code in browser

**To use Codespaces:**
1. Navigate to GitHub repository
2. Click "Code" → "Codespaces" → "New codespace"
3. Wait for environment to build
4. Follow setup steps above

### Local Development

**Recommended VS Code extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript

## Coding Standards

### TypeScript

**Type everything:**
```typescript
// Good
interface Member {
  id: number;
  email: string;
  name: string;
}

async function getMember(id: number): Promise<Member> {
  // ...
}

// Bad
async function getMember(id: any): Promise<any> {
  // ...
}
```

### React Components

**Server Components by default:**
```typescript
// app/(portal)/profile/page.tsx
// This is a Server Component (default)
export default async function ProfilePage() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Components when needed:**
```typescript
// components/profile/profile-form.tsx
'use client';

import { useState } from 'react';

export function ProfileForm() {
  const [value, setValue] = useState('');
  // Interactive logic
}
```

### File Naming

- **Pages**: `kebab-case` → `app/profile/page.tsx`
- **Components**: `kebab-case.tsx` → `components/profile-form.tsx`
- **Utilities**: `kebab-case.ts` → `lib/date-utils.ts`

### Import Order

```typescript
// 1. React
import { useState } from 'react';

// 2. Next.js
import { redirect } from 'next/navigation';

// 3. External libraries
import { z } from 'zod';

// 4. Internal utilities
import { cn } from '@/lib/utils';

// 5. Components
import { Button } from '@/components/ui/button';

// 6. Types
import type { Member } from '@/types/member';
```

## Database Workflow

### Modifying Schema

Only modify auth schema. All other data lives in Baserow.

1. **Update Schema**
   ```typescript
   // lib/db/schema/auth-schema.ts
   export const user = pgTable("user", {
     // ... existing fields
     newField: text("new_field"), // Add new field
   });
   ```

2. **Generate Migration**
   ```bash
   npm run db:generate
   ```

3. **Apply Migration**
   ```bash
   npm run db:push
   ```

### Querying Database (Postgres)

```typescript
import { db } from '@/lib/db/client';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Find user
const currentUser = await db.query.user.findFirst({
  where: eq(user.id, userId),
});

// Update user
await db.update(user)
  .set({ baserowMemberId: memberId })
  .where(eq(user.id, userId));
```

## Baserow Workflow

### Using MCP Server

**Always use MCP server to query schema. Don't guess!**

1. Use MCP tools to list tables
2. Use MCP tools to get table schema
3. Create TypeScript types based on actual schema
4. Build UI components

### Fetching from Baserow

```typescript
// lib/baserow/client.ts - Simple fetch wrapper
export async function baserowFetch(endpoint: string, options?: RequestInit) {
  const url = `${BASEROW_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Baserow error: ${response.statusText}`);
  }

  return response.json();
}
```

**Usage:**
```typescript
// Get member
const member = await baserowFetch(`/api/database/rows/table/${tableId}/${memberId}/`);

// Update member
const updated = await baserowFetch(`/api/database/rows/table/${tableId}/${memberId}/`, {
  method: 'PATCH',
  body: JSON.stringify({ name: 'New Name' }),
});
```

## API Routes

### Standard Pattern

```typescript
// app/api/baserow/members/[id]/route.ts
import { auth } from '@/lib/auth';
import { baserowFetch } from '@/lib/baserow/client';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1. Check auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch from Baserow
  const member = await baserowFetch(`/api/database/rows/table/${tableId}/${params.id}/`);

  // 3. Return data
  return NextResponse.json(member);
}
```

### Error Handling

```typescript
export async function GET(req: Request) {
  try {
    // ... handler logic
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Git Workflow

### Branch Strategy (Simple)

```
main (production)
  ├── feature/login-page
  ├── feature/profile-page
  └── fix/auth-redirect
```

### Commit Messages

Use conventional commits:

```bash
feat: add login page
fix: resolve auth redirect
docs: update README
style: format with prettier
refactor: simplify API route
```

### Workflow

1. **Create Branch**
   ```bash
   git checkout -b feature/profile-page
   ```

2. **Make Changes**
   ```bash
   git add .
   git commit -m "feat: add profile page"
   ```

3. **Push**
   ```bash
   git push origin feature/profile-page
   ```

4. **Merge to Main**
   ```bash
   git checkout main
   git merge feature/profile-page
   git push origin main
   ```

## Deployment

### Railway Deployment

**Automatic:**
1. Push to `main` branch
2. Railway detects changes
3. Builds and deploys
4. Done!

**Environment Variables:**
Set in Railway dashboard:
- `BETTER_AUTH_SECRET`
- `DATABASE_URL` (auto-injected)
- `BASEROW_API_KEY`
- `GOOGLE_CLIENT_ID` (if using)
- `GOOGLE_CLIENT_SECRET` (if using)

**Production URLs:**
Update `.env` in Railway:
```bash
BETTER_AUTH_URL=https://your-app.railway.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.railway.app
```

### Viewing Logs

**Railway dashboard:**
1. Go to your project
2. Click "Deployments"
3. View logs

**Or use Railway CLI:**
```bash
railway logs
```

## Testing

**For MVP: Manual testing is fine.**

Before deploying:
- [ ] Can log in
- [ ] Can view pages
- [ ] Can edit and save data
- [ ] No console errors
- [ ] Works on mobile (basic check)

## Troubleshooting

### "npm run dev" fails

```bash
# Clear cache
rm -rf .next

# Reinstall
rm -rf node_modules
npm install

# Try again
npm run dev
```

### Database connection error

- Check `DATABASE_URL` is correct
- Verify Railway Postgres is running
- Try `npm run db:studio` to test connection

### Baserow API errors

- Verify `BASEROW_API_KEY` is correct
- Check API key hasn't expired
- Test with curl:
  ```bash
  curl -H "Authorization: Token YOUR_KEY" \
    https://api.baserow.io/api/user/
  ```

### Build fails on Railway

- Check environment variables are set
- View deployment logs in Railway dashboard
- Verify all dependencies are in `package.json`

## Common Tasks

### Add a new page

1. Create page file: `app/(portal)/new-page/page.tsx`
2. Add to navigation: `components/portal/nav.tsx`
3. Create API route if needed: `app/api/baserow/new-resource/route.ts`

### Add a Baserow table

1. Create table in Baserow UI
2. Use MCP server to query schema
3. Create TypeScript types
4. Create API route to proxy requests
5. Build UI components

### Update styles

- Use Tailwind classes
- Use shadcn components
- No custom CSS unless necessary

## Best Practices

**Do:**
- ✅ Use Server Components by default
- ✅ Use MCP server for Baserow schemas
- ✅ Keep API keys server-side
- ✅ Validate user input with Zod
- ✅ Use shadcn components

**Don't:**
- ❌ Store business data in Postgres
- ❌ Guess Baserow schemas
- ❌ Expose API keys to client
- ❌ Premature optimization
- ❌ Over-engineer

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Baserow API Docs](https://api.baserow.io/api/redoc/)
- [Drizzle Docs](https://orm.drizzle.team/docs/overview)

## Quick Reference

**Common commands:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:push      # Apply schema changes
npm run db:studio    # Open database GUI
```

**Key files:**
- `app/(portal)/` - Protected pages
- `app/api/` - API routes
- `lib/baserow/` - Baserow integration
- `lib/auth.ts` - Auth config
- `middleware.ts` - Route protection

---

**Remember: Move fast, iterate later. Ship it! 🚀**
