# Forgot Password Implementation Guide

Complete guide for adding password reset functionality to the Member Portal.

## Overview

Better Auth 1.4.x includes built-in password reset functionality. This guide walks through what's provided out-of-the-box and what you need to implement.

## Current Status

- ✅ Better Auth installed (v1.4.10)
- ✅ Email/password authentication enabled
- ❌ Email provider not configured
- ❌ Password reset UI not implemented
- ❌ Email templates not created

## What's Included Out-of-the-Box

Better Auth automatically provides:

### 1. API Endpoints
- `/api/auth/forget-password` - Request password reset
- `/api/auth/reset-password` - Submit new password with token

### 2. Token Management
- Generates secure reset tokens
- Stores tokens in database
- Validates token expiry (default: 10 minutes)
- One-time use tokens (auto-deleted after use)

### 3. React Hooks
```typescript
import { authClient } from '@/lib/auth-client';

const { forgetPassword } = authClient;
const { resetPassword } = authClient;
```

## What You Need to Implement

### Phase 1: Email Service Integration (30 minutes)

#### Option A: Resend (Recommended)

**Why Resend:**
- Simple API
- Free tier: 100 emails/day
- Great for UHNWI use case (low volume, high reliability)
- Cost: $20/month for 10,000 emails

**Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain)
3. Get API key from dashboard

**Install:**
```bash
npm install resend
```

**Add to `.env`:**
```bash
RESEND_API_KEY=re_...your_key_here
```

**Configuration in `lib/auth.ts`:**
```typescript
import { betterAuth } from "better-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  // ... existing config

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,

    // Add password reset email handler
    sendResetPassword: async ({ user, url, token }) => {
      try {
        await resend.emails.send({
          from: 'Member Portal <noreply@yourdomain.com>',
          to: user.email,
          subject: 'Reset Your Password - Collaboration Circle',
          html: `
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name || 'there'},</p>
            <p>You requested to reset your password for the Collaboration Circle Member Portal.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Thanks,<br>The Collaboration Circle Team</p>
          `,
        });

        console.log(`[Auth] Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error('[Auth] Failed to send password reset email:', error);
        throw error;
      }
    },
  },
});
```

#### Option B: SendGrid

**Setup:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Free tier: 100 emails/day
3. Verify sender identity

**Install:**
```bash
npm install @sendgrid/mail
```

**Configuration:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const auth = betterAuth({
  // ... existing config

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,

    sendResetPassword: async ({ user, url }) => {
      await sgMail.send({
        from: 'noreply@yourdomain.com',
        to: user.email,
        subject: 'Reset Your Password',
        html: `Click here to reset: <a href="${url}">${url}</a>`,
      });
    },
  },
});
```

#### Option C: AWS SES

**Best for:** High volume, lowest cost ($0.10 per 1,000 emails)

**Setup:**
1. AWS Console → SES
2. Verify domain
3. Request production access (if sending to non-verified emails)

**Install:**
```bash
npm install @aws-sdk/client-ses
```

**Configuration:**
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,

    sendResetPassword: async ({ user, url }) => {
      await ses.send(new SendEmailCommand({
        Source: 'noreply@yourdomain.com',
        Destination: { ToAddresses: [user.email] },
        Message: {
          Subject: { Data: 'Reset Your Password' },
          Body: {
            Html: { Data: `Click here to reset: <a href="${url}">${url}</a>` },
          },
        },
      }));
    },
  },
});
```

### Phase 2: UI Components (2-3 hours)

#### 1. Forgot Password Form Component

**File:** `components/auth/forgot-password-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password", // Where to send user after clicking email link
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle>Check Your Email</CardTitle>
          </div>
          <CardDescription>
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 mb-4">
            Click the link in the email to reset your password. The link will expire in 10 minutes.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link href="/" className="text-sm text-neutral-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 2. Reset Password Form Component

**File:** `components/auth/reset-password-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!token) {
      setError("Invalid reset token. Please request a new reset link.");
      return;
    }

    setIsLoading(true);

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/?message=password-reset-success");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle>Password Reset Successful</CardTitle>
          </div>
          <CardDescription>
            Redirecting you to login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={8}
              />
            </div>
            <p className="text-xs text-neutral-500">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={8}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 3. Forgot Password Page

**File:** `app/forgot-password/page.tsx`

```typescript
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Member Portal</h1>
          <p className="text-neutral-600">Collaboration Circle</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
```

#### 4. Reset Password Page

**File:** `app/reset-password/page.tsx`

```typescript
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Member Portal</h1>
          <p className="text-neutral-600">Collaboration Circle</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
```

#### 5. Add Forgot Password Link to Login Form

**File:** `components/auth/login-form.tsx`

Add this after the password field:

```typescript
// After the password input div, before the submit button:

{mode === "login" && (
  <div className="flex justify-end">
    <Link
      href="/forgot-password"
      className="text-sm text-neutral-600 hover:underline"
    >
      Forgot password?
    </Link>
  </div>
)}
```

### Phase 3: Enhanced Email Template (Optional - 1 hour)

Create a professional HTML email template:

**File:** `lib/email/templates/reset-password.tsx`

```typescript
export function getResetPasswordEmailHTML(params: {
  userName: string | null;
  resetUrl: string;
  expiryMinutes: number;
}): string {
  const { userName, resetUrl, expiryMinutes } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1 style="margin: 0; font-size: 24px;">Collaboration Circle</h1>
      <p style="margin: 5px 0 0 0; color: #666;">Member Portal</p>
    </div>

    <h2>Reset Your Password</h2>

    <p>Hi ${userName || 'there'},</p>

    <p>You requested to reset your password for your Collaboration Circle Member Portal account.</p>

    <p>Click the button below to create a new password:</p>

    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>

    <div class="warning">
      <strong>⏰ This link expires in ${expiryMinutes} minutes</strong>
    </div>

    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>

    <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>

    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The Collaboration Circle Team</strong>
    </p>

    <div class="footer">
      <p>This is an automated message from Collaboration Circle Member Portal.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
```

Then update your auth config:

```typescript
import { getResetPasswordEmailHTML } from '@/lib/email/templates/reset-password';

sendResetPassword: async ({ user, url }) => {
  await resend.emails.send({
    from: 'Member Portal <noreply@yourdomain.com>',
    to: user.email,
    subject: 'Reset Your Password - Collaboration Circle',
    html: getResetPasswordEmailHTML({
      userName: user.name,
      resetUrl: url,
      expiryMinutes: 10,
    }),
  });
},
```

## Implementation Checklist

### Setup Phase (30 minutes)
- [ ] Choose email provider (Resend recommended)
- [ ] Sign up and verify account
- [ ] Get API key
- [ ] Add `RESEND_API_KEY` to `.env`
- [ ] Install email provider package
- [ ] Update `.env.sample` with new variable

### Backend Phase (30 minutes)
- [ ] Add email handler to `lib/auth.ts`
- [ ] Test email sending with console.log
- [ ] Verify emails are delivered
- [ ] Check spam folder if not received

### Frontend Phase (2-3 hours)
- [ ] Create `components/auth/forgot-password-form.tsx`
- [ ] Create `components/auth/reset-password-form.tsx`
- [ ] Create `app/forgot-password/page.tsx`
- [ ] Create `app/reset-password/page.tsx`
- [ ] Add "Forgot password?" link to login form
- [ ] Style components with shadcn

### Email Template Phase (Optional - 1 hour)
- [ ] Create HTML email template
- [ ] Add company branding
- [ ] Test rendering in different email clients
- [ ] Update auth handler to use template

### Testing Phase (30 minutes)
- [ ] Test forgot password flow end-to-end
- [ ] Verify email delivery
- [ ] Test reset with valid token
- [ ] Test reset with expired token
- [ ] Test reset with invalid token
- [ ] Test password requirements
- [ ] Test success redirect

### Production Deployment
- [ ] Add `RESEND_API_KEY` to Railway environment variables
- [ ] Verify domain is configured in Resend
- [ ] Update email "from" address to use verified domain
- [ ] Test in production environment
- [ ] Monitor email delivery logs

## Security Considerations

Better Auth handles these automatically:
- ✅ Secure token generation (cryptographically random)
- ✅ Token expiry (default 10 minutes)
- ✅ One-time use tokens
- ✅ Tokens stored hashed in database
- ✅ Rate limiting on reset requests

You should also:
- Use HTTPS in production (Railway provides this)
- Don't reveal whether email exists in database
- Log all password reset attempts for auditing

## Cost Estimates

### Email Provider Costs

**Resend (Recommended):**
- Free: 100 emails/day
- Pro: $20/month for 10,000 emails
- **Estimate for UHNWI portal:** ~$20/month (assuming <50 members, occasional resets)

**SendGrid:**
- Free: 100 emails/day
- Essentials: $20/month for 50,000 emails

**AWS SES:**
- $0.10 per 1,000 emails
- **Estimate:** <$1/month for UHNWI portal

## Troubleshooting

### Email not received
1. Check spam folder
2. Verify email provider API key
3. Check email provider dashboard for delivery logs
4. Ensure sender domain is verified

### Reset link expired
- Default expiry is 10 minutes
- Request new reset link
- Consider extending expiry in Better Auth config

### Token invalid
- Tokens are single-use
- Request new reset link if already used
- Check URL wasn't truncated in email client

### Cannot customize email
- Make sure you're passing the correct parameters
- Check HTML rendering in different email clients
- Use email testing services like Litmus or Email on Acid

## Next Steps

After implementing forgot password:
1. Add email verification for new signups
2. Add 2FA (Better Auth supports TOTP)
3. Add session management (view/revoke active sessions)
4. Add password strength requirements
5. Add password history (prevent reuse)

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Password Reset Guide](https://www.better-auth.com/docs/authentication/password-reset)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
