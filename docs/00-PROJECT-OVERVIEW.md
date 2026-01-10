# Member Portal - Project Overview

## Vision

An integrated operating system for ultra-high net worth individuals (UHNWI) that captures the **nodes** that matter (people, deals, companies, events, introductions) and the **connective tissue** between them (relationships, preferences, engagement, and outcomes).

## Purpose

A secure, UHNWI-grade member portal designed as a one-stop shop for Collaboration Circle members to access all resources, manage their profiles, view deals and events, and engage with the community.

## Core Principles

1. **Move Fast**: Get features working quickly, iterate later
2. **Admin-Friendly**: All data in Baserow so admins can easily modify
3. **Simple & Secure**: Basic security best practices, no overkill
4. **Elegant Design**: Clean, professional interface using shadcn/ui defaults
5. **Flexible**: Minimal Postgres (just auth), easy to migrate later

## Technical Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5
- **UI Library**: shadcn/ui (53 components)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL (Railway-hosted) - **AUTH ONLY**
- **ORM**: Drizzle ORM 0.45.1
- **Authentication**: Better Auth 1.4.9 with email/password + Google OAuth
- **Data Store**: Baserow (external API) - **ALL BUSINESS DATA**

### Infrastructure
- **Hosting**: Railway
- **Development**: GitHub Codespaces
- **Version Control**: Git/GitHub

## Architecture Pattern

### Data Storage Strategy

**PostgreSQL (Local) - Authentication Only**
- User accounts (email, password hash)
- Session management
- That's it!

**Baserow (External API) - Everything Else**
- Member profile details
- Event information and registrations
- Deal data and documents
- Content library
- Quick links
- Preferences
- All business data

**Why this approach?**
- Admins can modify data directly in Baserow
- Easy to migrate auth later if needed
- No complex sync logic
- Single source of truth for business data

## Feature Scope

### MVP (Current Focus)

1. **Authentication**
   - Email/password login
   - Google OAuth (optional)
   - Basic session management

2. **Home Page**
   - Simple dashboard
   - Show member name
   - Basic layout

3. **Profile Page**
   - View profile from Baserow
   - Edit basic fields
   - Save back to Baserow

4. **Events Page** (when table exists)
   - List events
   - View details
   - Register

5. **Deals Page** (when table exists)
   - List deals
   - View details

6. **Quick Links** (when table exists)
   - Display links from Baserow

### Future Enhancements

- Event recordings and transcripts
- Calendar integration
- Search and filters
- Advanced permissions
- Analytics
- Mobile app

## Security Requirements

**Basic Security Checklist:**
- ✅ Hash passwords (bcrypt via Better Auth)
- ✅ HTTPS in production
- ✅ Session tokens
- ✅ Basic input validation
- ✅ No API keys in client code
- ✅ Environment variables for secrets

**That's enough for now. No need to overthink it.**

## Development Approach

1. **Get it working first** - Perfect later
2. **Use Baserow MCP server** - Don't guess schemas
3. **Build incrementally** - One page at a time
4. **Test as you go** - Manual testing is fine
5. **Deploy often** - See it working live

## Success Metrics

**For the demo:**
- ✅ Can log in
- ✅ Can see profile
- ✅ Can view a page with real data
- ✅ Looks professional
- ✅ No errors

**That's the bar. Keep it simple.**
