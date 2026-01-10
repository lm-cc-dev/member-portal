# Member Portal Documentation

Welcome to the Collaboration Circle Member Portal documentation. This directory contains comprehensive documentation for building and maintaining the ultra-high net worth member portal.

## Documentation Index

### Core Documentation

1. **[00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md)**
   - Vision and purpose
   - MVP feature scope
   - Simple security requirements
   - Development approach: move fast, iterate later

2. **[01-ARCHITECTURE.md](./01-ARCHITECTURE.md)**
   - System architecture (Postgres = auth, Baserow = data)
   - Directory structure
   - Data flow (no caching, direct reads/writes)
   - Simple API patterns

3. **[02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md)**
   - PostgreSQL schema (auth only)
   - Baserow schema (use MCP server, don't guess)
   - User-to-member linking
   - No complex sync logic

4. **[03-SECURITY-GUIDELINES.md](./03-SECURITY-GUIDELINES.md)**
   - Basic security checklist
   - Password hashing (Better Auth)
   - API key protection
   - What NOT to worry about yet

5. **[04-DEVELOPMENT-WORKFLOW.md](./04-DEVELOPMENT-WORKFLOW.md)**
   - Getting started
   - Coding standards (simple)
   - Database workflow (Postgres auth only)
   - Baserow workflow (use MCP server)
   - Git workflow (simple branching)
   - Deployment (Railway auto-deploy)

6. **[05-BASEROW-INTEGRATION.md](./05-BASEROW-INTEGRATION.md)**
   - Baserow setup
   - Simple client implementation
   - MCP server usage (required!)
   - API route patterns
   - No caching for MVP

6a. **[BASEROW-FIELD-IDS.md](./BASEROW-FIELD-IDS.md)**
   - Field ID reference guide
   - How to get field IDs
   - Field ID vs field name patterns
   - Option ID reference (for select fields)

7. **[06-IMPLEMENTATION-PLAN.md](./06-IMPLEMENTATION-PLAN.md)**
   - MVP-focused implementation guide
   - 8 phases, ~3-4 hours total
   - Step-by-step with code examples
   - What to skip for MVP
   - Testing checklist

8. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)**
   - Common commands
   - Code patterns
   - Quick snippets

## Quick Start

### For Developers

1. **Read** [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) - Understand the MVP approach
2. **Follow** [04-DEVELOPMENT-WORKFLOW.md](./04-DEVELOPMENT-WORKFLOW.md) - Get set up
3. **Build** using [06-IMPLEMENTATION-PLAN.md](./06-IMPLEMENTATION-PLAN.md) - Step by step
4. **Reference** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Common patterns

### Key Principles

1. **Postgres = Auth Only** - Don't store business data
2. **Baserow = Everything Else** - Single source of truth
3. **Use MCP Server** - Don't guess schemas
4. **No Caching** - Direct reads/writes for MVP
5. **Move Fast** - Ship it, iterate later

## Project Structure

```
member-portal/
├── app/                    # Next.js pages and API routes
│   ├── (auth)/            # Login page
│   ├── (portal)/          # Protected pages (home, profile, etc.)
│   └── api/               # API routes (auth, baserow proxy)
├── components/             # React components
│   ├── ui/                # shadcn components
│   ├── auth/              # Auth components
│   └── portal/            # Portal layout
├── lib/                    # Core libraries
│   ├── auth.ts            # Better Auth config
│   ├── db/                # Postgres (auth only)
│   └── baserow/           # Baserow client
├── docs/                   # Documentation (you are here)
└── middleware.ts           # Auth middleware
```

## Key Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (auth only) + Baserow (all data)
- **Auth**: Better Auth (email/password + Google OAuth)
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Railway

## MVP Features

For the urgent demo:

- ✅ Email/password login
- ✅ Simple home page
- ✅ Profile view/edit (from Baserow)
- ✅ Professional UI with shadcn
- ✅ No errors

Future features (after demo):
- Events system
- Deals system
- Quick links
- Search and filters

## Getting Help

- **Setup**: See [04-DEVELOPMENT-WORKFLOW.md](./04-DEVELOPMENT-WORKFLOW.md) - Troubleshooting
- **Baserow**: See [05-BASEROW-INTEGRATION.md](./05-BASEROW-INTEGRATION.md)
- **Architecture**: See [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)
- **Quick Patterns**: See [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)

## Development Approach

**For MVP:**
- Get it working first
- Use MCP server for Baserow schemas
- No caching or optimization
- Manual testing is fine
- Deploy often

**Later:**
- Add caching if needed
- Add advanced features
- Optimize performance
- Add automated tests

## Contributing

When adding features:

1. Use MCP server to understand Baserow schema
2. Create API route to proxy Baserow
3. Build UI with shadcn components
4. Test manually
5. Push to deploy

## Documentation Maintenance

This documentation is designed to be:
- Simple and focused on MVP
- Updated as Baserow schema changes
- Referenced via MCP server for schemas
- Action-oriented, not theory

---

**Remember: Move fast, ship it, iterate later. 🚀**
