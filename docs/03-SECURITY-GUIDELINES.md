# Security Guidelines

## Security Philosophy

**Keep it simple and secure:**
- Follow basic security best practices
- Don't expose vulnerabilities
- Don't overthink it
- Move fast, iterate later

## Authentication Security

### Password Storage

**Better Auth handles this automatically:**
- Passwords are hashed with bcrypt
- Never store plain text passwords
- Never log passwords
- Use Better Auth's built-in methods

### Session Management

```typescript
// Better Auth default session config (good enough)
{
  expiresIn: 7 * 24 * 60 * 60, // 7 days
  updateAge: 24 * 60 * 60, // Update every 24 hours
}
```

**Session security:**
- HTTP-only cookies (prevent XSS)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)

### OAuth (Google)

- Use Better Auth's Google provider
- Store client ID and secret in environment variables
- Don't expose credentials in code

## Authorization

### Basic Access Control

```typescript
// In API routes
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // User is authenticated, proceed
}
```

### Check User Permissions

```typescript
// For admin-only endpoints
if (session.user.role !== 'admin') {
  return new Response('Forbidden', { status: 403 });
}
```

**That's it. Keep it simple.**

## Data Protection

### Environment Variables

**Required:**
```bash
BETTER_AUTH_SECRET=<random-string>  # openssl rand -base64 48
DATABASE_URL=<postgres-url>
GOOGLE_CLIENT_ID=<google-id>
GOOGLE_CLIENT_SECRET=<google-secret>
BASEROW_API_KEY=<baserow-key>
```

**Rules:**
- Never commit .env files
- Use different values for dev/prod
- Store in Railway for production

### API Security

**Baserow API Key:**
- Store in environment variables
- Only use server-side (API routes)
- Never expose to client

```typescript
// GOOD - Server-side API route
export async function GET() {
  const apiKey = process.env.BASEROW_API_KEY;
  const data = await fetch(baserowUrl, {
    headers: { 'Authorization': `Token ${apiKey}` }
  });
}

// BAD - Never do this
const apiKey = process.env.NEXT_PUBLIC_BASEROW_API_KEY; // DON'T!
```

### HTTPS

**Production only:**
- Railway provides HTTPS automatically
- All connections encrypted in transit
- No extra configuration needed

## Input Validation

### Validate User Input

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// In API route
const body = await req.json();
const validated = schema.safeParse(body);

if (!validated.success) {
  return new Response('Invalid input', { status: 400 });
}
```

**Why:**
- Prevent bad data
- Prevent injection attacks
- Good UX with error messages

## Common Vulnerabilities to Avoid

### XSS (Cross-Site Scripting)

**React handles this by default:**
- React escapes content automatically
- Don't use `dangerouslySetInnerHTML` unless you know what you're doing

### SQL Injection

**Drizzle ORM prevents this:**
- Use Drizzle's query builder
- Never concatenate SQL strings
- Always use parameterized queries

```typescript
// GOOD
const user = await db.query.user.findFirst({
  where: eq(user.email, email)
});

// BAD - Never do this
const user = await db.execute(`SELECT * FROM user WHERE email = '${email}'`);
```

### CSRF (Cross-Site Request Forgery)

**Better Auth handles this:**
- Built-in CSRF protection
- SameSite cookies
- Token validation

## Security Checklist

Before deploying:

- [ ] All secrets in environment variables
- [ ] No .env files committed to Git
- [ ] HTTPS enabled in production
- [ ] Baserow API key only used server-side
- [ ] Input validation on all forms
- [ ] Using Drizzle query builder (not raw SQL)
- [ ] Using Better Auth for authentication

**That's the list. Don't overthink it.**

## What NOT to Worry About (Yet)

These are important but can wait:

- ❌ API key rotation
- ❌ Advanced threat detection
- ❌ Penetration testing
- ❌ Compliance certifications
- ❌ Complex audit logging
- ❌ Rate limiting (unless you see abuse)
- ❌ Advanced monitoring

**Focus on the demo first. Add these later if needed.**

## If Something Goes Wrong

1. Check Railway logs
2. Look for error messages
3. Verify environment variables are set
4. Make sure Baserow API key is valid
5. Check Google OAuth credentials

## Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) (if you want to go deeper later)

**Remember: Secure by default, but don't let perfect be the enemy of good.**
