# Baserow Integration Guide

## Overview

Baserow is the **single source of truth** for all business data. The Next.js app is just a UI layer that reads/writes to Baserow via API.

## Why Baserow?

1. **Admin-friendly** - Team can modify data directly
2. **Flexible** - Change schema without code deploys
3. **Simple** - No complex sync logic needed
4. **Fast** - Get features working quickly

## Setup

### 1. Create Baserow Account

1. Sign up at [Baserow.io](https://baserow.io)
2. Create workspace: "Collaboration Circle"

### 2. Get API Token

1. Click profile → Settings
2. Navigate to "API tokens"
3. Click "Create token"
4. Name: "Member Portal"
5. Select permissions (all tables)
6. Copy token → save to `.env`

### 3. Add to Environment

```bash
# .env
BASEROW_API_KEY=your_token_here
```

## Field IDs vs Field Names

**CRITICAL: Always use field IDs for stability, but use field names for readability.**

See [BASEROW-FIELD-IDS.md](./BASEROW-FIELD-IDS.md) for complete documentation.

### Quick Summary

- **Field IDs are stable** - They never change (e.g., `field_12345`)
- **Field names can change** - Admins can rename fields in Baserow UI
- **Store field ID mappings** in [lib/baserow/config.ts](../lib/baserow/config.ts)
- **Use field names in code** with `useFieldNames: true` parameter
- **Reference field IDs in docs** for maintainability

### Getting Field IDs

```bash
# Run the discovery script
npm run baserow:get-fields

# Or use the MCP server during development
```

## Using MCP Server

**IMPORTANT: Always use MCP server to query schemas.**

### Why?

- Schemas change frequently
- Tables may not exist yet
- Field names may differ
- No guessing needed

### How to Use MCP

The MCP server is already configured. Use it to:

1. List all tables
2. Get table schema
3. Query rows
4. Create/update rows

**Don't hardcode field names or structures in your code!**

## Basic Client Implementation

### Simple Fetch Wrapper

```typescript
// lib/baserow/config.ts
export const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://api.baserow.io';
export const BASEROW_API_KEY = process.env.BASEROW_API_KEY;

if (!BASEROW_API_KEY) {
  console.warn('BASEROW_API_KEY not set');
}
```

```typescript
// lib/baserow/client.ts
import { BASEROW_API_URL, BASEROW_API_KEY } from './config';

export async function baserowFetch(endpoint: string, options: RequestInit = {}) {
  // Server-side only!
  if (typeof window !== 'undefined') {
    throw new Error('Baserow API can only be called server-side');
  }

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
    const error = await response.text();
    console.error('Baserow error:', error);
    throw new Error(`Baserow API error: ${response.statusText}`);
  }

  return response.json();
}
```

**That's it! Keep it simple.**

## Common Operations

### Get All Rows

```typescript
const response = await baserowFetch('/api/database/rows/table/TABLE_ID/');
// Returns: { count, next, previous, results: [...] }
```

### Get Single Row

```typescript
const row = await baserowFetch('/api/database/rows/table/TABLE_ID/ROW_ID/');
```

### Create Row

```typescript
const newRow = await baserowFetch('/api/database/rows/table/TABLE_ID/', {
  method: 'POST',
  body: JSON.stringify({
    field_12345: 'value',
    field_67890: 'another value',
  }),
});
```

### Update Row

```typescript
const updated = await baserowFetch('/api/database/rows/table/TABLE_ID/ROW_ID/', {
  method: 'PATCH',
  body: JSON.stringify({
    field_12345: 'new value',
  }),
});
```

### Filter and Search

```typescript
// Filter by field value
const filtered = await baserowFetch(
  '/api/database/rows/table/TABLE_ID/?filter__field_123__equal=active'
);

// Search
const searched = await baserowFetch(
  '/api/database/rows/table/TABLE_ID/?search=query'
);

// Order by
const ordered = await baserowFetch(
  '/api/database/rows/table/TABLE_ID/?order_by=field_123'
);
```

## API Route Pattern

**Always proxy Baserow calls through Next.js API routes.**

```typescript
// app/api/baserow/members/[id]/route.ts
import { auth } from '@/lib/auth';
import { baserowFetch } from '@/lib/baserow/client';
import { NextResponse } from 'next/server';

const MEMBERS_TABLE_ID = process.env.BASEROW_TABLE_MEMBERS || '12345';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch from Baserow
  try {
    const member = await baserowFetch(
      `/api/database/rows/table/${MEMBERS_TABLE_ID}/${params.id}/`
    );
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await baserowFetch(
      `/api/database/rows/table/${MEMBERS_TABLE_ID}/${params.id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
```

## User-to-Member Linking

### On Login

```typescript
// After user logs in, link to Baserow member
async function linkUserToBaserow(userId: string, email: string) {
  // Check if already linked
  const user = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (user?.baserowMemberId) {
    return user.baserowMemberId; // Already linked
  }

  // Search Baserow for member by email
  const members = await baserowFetch(
    `/api/database/rows/table/${MEMBERS_TABLE_ID}/?search=${email}`
  );

  let memberId: string;

  if (members.results.length > 0) {
    // Found existing member
    memberId = members.results[0].id;
  } else {
    // Create new member
    const newMember = await baserowFetch(
      `/api/database/rows/table/${MEMBERS_TABLE_ID}/`,
      {
        method: 'POST',
        body: JSON.stringify({
          field_email: email, // Use actual field ID from MCP
          field_name: user.name || '',
        }),
      }
    );
    memberId = newMember.id;
  }

  // Store link in Postgres
  await db.update(user)
    .set({ baserowMemberId: memberId })
    .where(eq(user.id, userId));

  return memberId;
}
```

## TypeScript Types

**Create types based on MCP server schema:**

```typescript
// types/member.ts
// IMPORTANT: Get field names from MCP server, don't guess!

export interface BaserowMember {
  id: number;
  order: string;

  // Use actual field IDs from Baserow
  field_12345: string; // email
  field_67890: string; // name
  field_11111: string; // company
  // ... etc
}

// Helper to map to friendly names
export interface Member {
  id: number;
  email: string;
  name: string;
  company: string;
}

export function mapBaserowMember(raw: BaserowMember): Member {
  return {
    id: raw.id,
    email: raw.field_12345,
    name: raw.field_67890,
    company: raw.field_11111,
  };
}
```

## Error Handling

```typescript
async function fetchMember(id: string) {
  try {
    const member = await baserowFetch(`/api/database/rows/table/${tableId}/${id}/`);
    return { success: true, data: member };
  } catch (error) {
    console.error('Baserow error:', error);
    return { success: false, error: 'Failed to fetch member' };
  }
}
```

## Security Best Practices

**Do:**
- ✅ Keep API key in environment variables
- ✅ Only call Baserow from server-side
- ✅ Use API routes as proxy
- ✅ Check authentication before Baserow calls

**Don't:**
- ❌ Never expose API key to client
- ❌ Don't call Baserow directly from client components
- ❌ Don't hardcode table IDs in components

## Table ID Configuration

```bash
# .env
BASEROW_TABLE_MEMBERS=12345
BASEROW_TABLE_EVENTS=67890
BASEROW_TABLE_DEALS=11111
```

```typescript
// lib/baserow/config.ts
export const TABLES = {
  MEMBERS: process.env.BASEROW_TABLE_MEMBERS || '',
  EVENTS: process.env.BASEROW_TABLE_EVENTS || '',
  DEALS: process.env.BASEROW_TABLE_DEALS || '',
};
```

## API Token Types

Baserow has two authentication methods with different capabilities:

### Database Tokens (API Tokens)

Created via Settings → API tokens. These tokens are used for **row-level operations only**:

- ✅ Read rows
- ✅ Create rows
- ✅ Update rows
- ✅ Delete rows
- ❌ **Cannot** create/modify fields (schema changes)
- ❌ **Cannot** create/modify tables

```bash
# Row operations use "Token" prefix
curl -H "Authorization: Token YOUR_API_TOKEN" \
  https://baserow-production-9f1c.up.railway.app/api/database/rows/table/TABLE_ID/
```

### JWT Authentication (User Login)

Required for **schema modifications** (adding fields, creating tables, etc.):

```bash
# Step 1: Get JWT token via login
curl -X POST "https://baserow-production-9f1c.up.railway.app/api/user/token-auth/" \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "your_password"}'

# Response includes: { "token": "eyJ...", "access_token": "eyJ...", ... }

# Step 2: Use JWT for schema operations
curl -X POST "https://baserow-production-9f1c.up.railway.app/api/database/fields/table/TABLE_ID/" \
  -H "Authorization: JWT eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Field",
    "type": "single_select",
    "select_options": [
      {"value": "Option 1", "color": "blue"},
      {"value": "Option 2", "color": "green"}
    ]
  }'
```

### When to Use Each

| Operation | Token Type |
|-----------|------------|
| Read/write rows | Database Token (`Token xxx`) |
| List fields | Database Token (`Token xxx`) |
| Create/delete fields | JWT (`JWT xxx`) |
| Create/delete tables | JWT (`JWT xxx`) |

## Testing with curl

```bash
# List tables
curl -H "Authorization: Token YOUR_TOKEN" \
  https://baserow-production-9f1c.up.railway.app/api/database/tables/

# Get rows
curl -H "Authorization: Token YOUR_TOKEN" \
  https://baserow-production-9f1c.up.railway.app/api/database/rows/table/TABLE_ID/

# Create row
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field_123": "value"}' \
  https://baserow-production-9f1c.up.railway.app/api/database/rows/table/TABLE_ID/

# List fields in a table
curl -H "Authorization: Token YOUR_TOKEN" \
  https://baserow-production-9f1c.up.railway.app/api/database/fields/table/TABLE_ID/

# Create a new field (requires JWT)
curl -X POST \
  -H "Authorization: JWT YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Field Name", "type": "text"}' \
  https://baserow-production-9f1c.up.railway.app/api/database/fields/table/TABLE_ID/
```

## Troubleshooting

### 401 Unauthorized

- Check API token is correct
- Verify token hasn't expired
- Check token has access to table

### 404 Not Found

- Verify table ID is correct
- Check table exists in Baserow
- Use MCP server to confirm table ID

### 400 Bad Request

- Check field IDs are correct
- Verify data types match
- Use MCP server to see expected format

## No Caching (For MVP)

**Keep it simple:**
- Read directly from Baserow every time
- Write directly to Baserow
- No local cache
- No Redis
- No complex sync

**Why?**
- Fast to build
- Always fresh data
- No cache invalidation issues
- Easy to debug

**Add caching later if needed.**

## Resources

- [Baserow API Docs](https://api.baserow.io/api/redoc/)
- [MCP Server](use provided MCP tools)
- [Baserow Community](https://community.baserow.io/)

---

**Key Takeaways:**
1. Use MCP server for schemas
2. Always proxy through API routes
3. No caching for MVP
4. Keep it simple

**Ship it! 🚀**
