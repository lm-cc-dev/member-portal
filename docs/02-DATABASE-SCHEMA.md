# Database Schema Documentation

## Overview

The member portal uses a **minimal PostgreSQL database** for authentication only. All business data lives in Baserow.

## PostgreSQL Schema (Auth Only)

### Philosophy

**Keep it simple:**
- Only store what's needed for authentication
- No duplication of Baserow data
- Easy to migrate later if needed

### Authentication Tables (Better Auth)

#### `user`

Basic user account for login.

```typescript
user {
  id: string (uuid, primary key)
  email: string (unique, not null)
  emailVerified: boolean (default false)
  name: string (nullable)
  image: string (nullable)
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())

  // Link to Baserow member record
  baserowMemberId: string (nullable) // Baserow Members table record ID
}
```

#### `session`

User sessions.

```typescript
session {
  id: string (uuid, primary key)
  userId: string (FK -> user.id, on delete cascade)
  token: string (unique, not null)
  expiresAt: timestamp (not null)
  ipAddress: string (nullable)
  userAgent: string (nullable)
  createdAt: timestamp (default now())
}
```

#### `account`

OAuth provider accounts (Google, etc.).

```typescript
account {
  id: string (uuid, primary key)
  userId: string (FK -> user.id, on delete cascade)
  providerId: string (not null) // 'google', etc.
  accountId: string (not null) // Provider's user ID
  accessToken: string (nullable)
  refreshToken: string (nullable)
  expiresAt: timestamp (nullable)
  createdAt: timestamp (default now())
}
```

#### `verification`

Email verification tokens.

```typescript
verification {
  id: string (uuid, primary key)
  identifier: string (not null) // Email
  value: string (not null) // Verification token
  expiresAt: timestamp (not null)
  createdAt: timestamp (default now())
}
```

**That's it! No other tables needed in Postgres.**

---

## Baserow Schema

### Important Notes

**DO NOT GUESS SCHEMAS!**

1. Use the **Baserow MCP server** to get current schema
2. Schemas will change frequently
3. Tables may not exist yet (e.g., Events, Deals)
4. Always query MCP server for latest structure

### How to Use MCP Server

```typescript
// Example: Get current Members table schema
// Use MCP server tools to query Baserow
// Don't hardcode field names or structures
```

### Current Tables (Reference Only)

**Note:** These are subject to change. Always check MCP server.

#### Members Table

Basic member information. Check MCP server for current fields.

Example fields (may change):
- email
- firstName
- lastName
- company
- etc.

#### Quick Links Table (To be created)

Will store customizable quick links. Structure TBD.

#### Events Table (To be created)

Will store events when ready. Structure TBD.

#### Deals Table (To be created)

Will store deals when ready. Structure TBD.

### Data Flow

```
1. User logs in (PostgreSQL auth)
2. Get user.baserowMemberId
3. Fetch member data from Baserow using MCP server
4. Display to user
5. On update, save directly to Baserow
6. No caching (for now)
```

## Migration Strategy

### Current State

1. PostgreSQL has Better Auth tables + baserowMemberId link
2. Baserow has Members table (minimum)
3. Connection: user.email matches Baserow member email

### When Adding New Features

1. Create table in Baserow first
2. Use MCP server to understand schema
3. Build UI to display/edit data
4. Always read/write directly to Baserow
5. No local caching

### User Sync on Login

```typescript
// Simplified sync logic
1. User logs in
2. Check if user.baserowMemberId exists
3. If not:
   - Search Baserow for member by email
   - If found, store ID in user.baserowMemberId
   - If not found, create new member in Baserow
4. Continue to app
```

## Schema Updates

**When schemas change:**
1. Baserow admin updates in Baserow UI
2. Developer queries MCP server to see changes
3. Update TypeScript types if needed
4. Update UI components
5. No database migration needed!

**Benefits:**
- Fast iteration
- Admin can change data structure
- No downtime for schema changes
- TypeScript types are just helpers

## Backup Strategy

**PostgreSQL:**
- Railway automated backups (auth data)
- Minimal data to backup

**Baserow:**
- Baserow's built-in backups
- All business data backed up there

## Keep It Simple

- Don't add tables to Postgres unless absolutely necessary
- When in doubt, put it in Baserow
- Use MCP server, don't guess
- Move fast, iterate later
