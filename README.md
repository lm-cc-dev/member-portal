# Collaboration Circle - Member Portal

An ultra-high net worth member portal for the Collaboration Circle, providing secure access to member resources, events, deals, and personalized content.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/nextjs-better-auth-shadcn?referralCode=Z1xivh&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Overview

The Member Portal is a secure, elegant web application designed for ultra-high net worth individuals to:

- Access personalized dashboard with upcoming events and deals
- Manage their profile and preferences
- Browse and register for exclusive events
- View and participate in investment opportunities
- Access curated content and resources
- Customize quick links for easy navigation

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

- **[Project Overview](./docs/00-PROJECT-OVERVIEW.md)** - Vision, purpose, and requirements
- **[Architecture](./docs/01-ARCHITECTURE.md)** - System design and structure
- **[Database Schema](./docs/02-DATABASE-SCHEMA.md)** - Data models and relationships
- **[Security Guidelines](./docs/03-SECURITY-GUIDELINES.md)** - Security best practices
- **[Development Workflow](./docs/04-DEVELOPMENT-WORKFLOW.md)** - Setup and coding standards
- **[Baserow Integration](./docs/05-BASEROW-INTEGRATION.md)** - External data store integration
- **[Implementation Plan](./docs/06-IMPLEMENTATION-PLAN.md)** - Step-by-step build guide
- **[Quick Reference](./docs/QUICK-REFERENCE.md)** - Common commands and patterns

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5
- **UI Library**: shadcn/ui (53 components)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL (Railway-hosted)
- **ORM**: Drizzle ORM 0.45.1
- **Authentication**: Better Auth 1.4.9 with Google OAuth
- **Data Store**: Baserow (external API)

### Infrastructure
- **Hosting**: Railway
- **Development**: GitHub Codespaces
- **Version Control**: Git/GitHub

## Features

### Core Features

✅ **Secure Authentication**
- Google OAuth login (password-less)
- Secure session management
- Role-based access control

✅ **Personalized Home**
- Welcome dashboard with member name
- Upcoming events preview
- Recent deals and activity
- Quick action buttons

✅ **Profile Management**
- View and edit personal information
- Manage notification preferences
- Privacy settings
- Theme customization
- Bi-directional sync with Baserow

✅ **Events System**
- Browse upcoming events
- View detailed event information
- Register for events
- Track event history
- Access event recordings and content

✅ **Deals Platform**
- View active investment opportunities
- Access deal documents and materials
- Track deal participation
- Investment history

✅ **Quick Links**
- Customizable quick access links
- Default links to key resources
- Easy management and reordering

### Security Features

🔒 **Enterprise-Grade Security**
- OAuth 2.0 authentication (no password storage)
- Encrypted data at rest and in transit
- Row-level security
- Audit logging for all actions
- GDPR compliance
- Rate limiting
- CSRF protection

## Prerequisites

- Node.js 20+ installed
- Git installed
- PostgreSQL database (provided by Railway)
- Google OAuth credentials
- Baserow account and API key

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd member-portal
npm install
```

### 2. Set Up Environment Variables

Copy the sample environment file:

```bash
cp .env.sample .env
```

Edit `.env` with your configuration:

```bash
# Authentication (generate secret: openssl rand -base64 48)
BETTER_AUTH_SECRET=<random-64-char-string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Database (use Railway PostgreSQL URL)
DATABASE_URL=postgresql://user:pass@host:port/db

# Google OAuth (see setup instructions below)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Baserow
BASEROW_API_URL=https://api.baserow.io
BASEROW_API_KEY=<your-baserow-api-key>
BASEROW_TABLE_MEMBERS=<table-id>
BASEROW_TABLE_EVENTS=<table-id>
BASEROW_TABLE_DEALS=<table-id>

# Security (generate key: openssl rand -hex 32)
ENCRYPTION_KEY=<random-hex-string>
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

**Detailed instructions**: See [Development Workflow](./docs/04-DEVELOPMENT-WORKFLOW.md)

### 4. Set Up Baserow

1. Create account at [Baserow.io](https://baserow.io)
2. Create workspace: "Collaboration Circle"
3. Create tables following [Database Schema](./docs/02-DATABASE-SCHEMA.md)
4. Generate API token in settings
5. Add token and table IDs to `.env`

**Detailed instructions**: See [Baserow Integration](./docs/05-BASEROW-INTEGRATION.md)

### 5. Initialize Database

```bash
npm run db:push
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
member-portal/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   └── login/
│   ├── (portal)/                 # Protected portal pages
│   │   ├── home/
│   │   ├── profile/
│   │   ├── events/
│   │   ├── deals/
│   │   └── quick-links/
│   └── api/                      # API routes
│       ├── auth/                 # Better Auth
│       ├── baserow/              # Baserow proxy
│       └── user/                 # User management
├── components/                   # React components
│   ├── ui/                       # shadcn components
│   ├── auth/                     # Auth components
│   ├── portal/                   # Portal layout
│   ├── events/                   # Event components
│   └── deals/                    # Deal components
├── lib/                          # Core libraries
│   ├── auth.ts                   # Auth config
│   ├── db/                       # Database
│   │   ├── client.ts
│   │   ├── schema/
│   │   └── queries/
│   ├── baserow/                  # Baserow integration
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── queries/
│   └── utils.ts
├── types/                        # TypeScript types
├── docs/                         # Documentation
└── middleware.ts                 # Auth middleware
```

## Available Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
npm run db:generate  # Generate migration from schema
npm run db:push      # Apply schema to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Implementation Guide

Follow the [Implementation Plan](./docs/06-IMPLEMENTATION-PLAN.md) for detailed, step-by-step instructions to build the portal:

### Phase 1: Foundation & Setup
- Environment configuration
- Database schema extensions
- Core utilities and types
- Middleware setup

### Phase 2: Authentication & User Management
- Better Auth configuration
- Login page
- User menu component
- Audit logging

### Phase 3: Baserow Integration
- Baserow client implementation
- Query helpers
- User synchronization
- API routes

### Phase 4: Core Pages - Home & Profile
- Portal layout
- Home page
- Profile management

### Phase 5: Events System
- Events list and filters
- Event details and registration
- My events page

### Phase 6: Deals System
- Deals list and filters
- Deal details and documents
- My deals page

### Phase 7: Quick Links & Navigation
- Quick links management
- Global search

### Phase 8: Polish & Production Ready
- Theme support
- Error handling
- Loading states
- Responsive design
- Performance optimization
- Security audit
- Production deployment

## Development Workflow

### Coding Standards

- **TypeScript**: Strict mode enabled, type everything
- **Components**: Server components by default, client when needed
- **File Naming**: kebab-case for files, PascalCase for components
- **Import Order**: React → Next.js → External → Internal → Components → Types
- **Styling**: Tailwind CSS with shadcn components

**See**: [Development Workflow](./docs/04-DEVELOPMENT-WORKFLOW.md)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

## Security

The portal implements enterprise-grade security:

- 🔐 OAuth 2.0 authentication (no passwords)
- 🔒 Encrypted data at rest and in transit
- 👤 Row-level security and access control
- 📝 Complete audit logging
- 🛡️ CSRF and XSS protection
- ⚡ Rate limiting on all endpoints
- 🔑 Secure API key management
- ✅ GDPR compliance

**See**: [Security Guidelines](./docs/03-SECURITY-GUIDELINES.md)

## Architecture

### Hybrid Data Model

The portal uses a dual-database architecture:

**PostgreSQL (Local)**
- User accounts and authentication
- Session management
- User-to-Baserow record mapping
- System metadata

**Baserow (External API)**
- Member profiles and details
- Event information
- Deal data
- Content library

**See**: [Architecture](./docs/01-ARCHITECTURE.md)

## Deployment

### Railway Deployment

1. Push to `main` branch
2. Railway automatically:
   - Detects changes
   - Runs build
   - Applies migrations
   - Deploys app
   - Runs health checks

### Environment Variables

Set all required environment variables in Railway dashboard:

- Authentication credentials
- Database URLs
- API keys
- Production URLs

### Monitoring

- View logs in Railway dashboard
- Monitor performance metrics
- Track error rates
- Set up alerts

**See**: [Development Workflow](./docs/04-DEVELOPMENT-WORKFLOW.md) - Deployment section

## Support & Resources

### Documentation

- 📚 [Full Documentation](./docs)
- 🚀 [Implementation Plan](./docs/06-IMPLEMENTATION-PLAN.md)
- ⚡ [Quick Reference](./docs/QUICK-REFERENCE.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Baserow API Documentation](https://api.baserow.io/api/redoc/)

### Getting Help

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Check `/docs` directory
- **Code Review**: Submit pull requests

## Contributing

1. Read the [Development Workflow](./docs/04-DEVELOPMENT-WORKFLOW.md)
2. Follow [Security Guidelines](./docs/03-SECURITY-GUIDELINES.md)
3. Create feature branch
4. Make changes following coding standards
5. Submit pull request with clear description

## License

Copyright © 2026 Collaboration Circle. All rights reserved.

---

**Note**: This portal handles highly confidential member data. Always follow security best practices and ensure proper authorization before accessing or modifying any data.
