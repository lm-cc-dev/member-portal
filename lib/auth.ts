import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import { user as userTable } from "@/lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import {
  findMemberByEmail,
  isMemberEligibleToRegister,
  getMemberIneligibilityReason,
  updateMemberPortalId,
} from "@/lib/baserow/members";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // Trust origins for development and production
  // Function returns an array of trusted origin patterns
  trustedOrigins: async () => {
    const origins: string[] = [
      // Trust localhost in development (both http and https)
      "http://localhost:*",
      "https://localhost:*",
      "http://127.0.0.1:*",
      "https://127.0.0.1:*",
      // Trust GitHub Codespaces
      "https://*.app.github.dev",
    ];

    // Trust production URL
    if (process.env.BETTER_AUTH_URL) {
      origins.push(process.env.BETTER_AUTH_URL);
    }

    // Trust additional origins from TRUSTED_ORIGINS env var
    const envOrigins = process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim()) || [];
    origins.push(...envOrigins);

    return origins;
  },

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  // Hooks for registration flow
  hooks: {
    // Before user creation - validate they exist in Baserow and are eligible
    before: createAuthMiddleware(async (ctx) => {
      // Only run on sign-up/registration
      if (ctx.path === '/sign-up/email') {
        const body = ctx.body as { email?: string };
        const email = body?.email;

        if (!email) {
          throw new APIError('BAD_REQUEST', { message: 'Email is required' });
        }

        console.log(`[Auth] Checking member eligibility for: ${email}`);

        // Find member in Baserow
        const member = await findMemberByEmail(email);

        if (!member) {
          throw new APIError('FORBIDDEN', {
            message: 'Not a registered Member. Please contact Samira at samira@collaborationcircle.com to apply.'
          });
        }

        // Check if member is eligible (Member Status = "Active")
        if (!isMemberEligibleToRegister(member)) {
          const reason = getMemberIneligibilityReason(member);
          throw new APIError('FORBIDDEN', {
            message: reason || 'You are not eligible to register at this time.'
          });
        }

        // Check if member already has a portal account
        if (member['Portal ID']) {
          throw new APIError('FORBIDDEN', {
            message: 'An account already exists for this email. Please try logging in or contact support.'
          });
        }

        // Store member data in context for the after hook
        ctx.context.baserowMemberId = member.id.toString();
        ctx.context.baserowMemberName = member.Name || email.split('@')[0];

        console.log(`[Auth] Member ${email} is eligible for registration`);
      }
    }),

    // After user creation - link to Baserow
    after: createAuthMiddleware(async (ctx) => {
      // Only run on sign-up/registration
      if (ctx.path === '/sign-up/email') {
        const newSession = ctx.context.newSession;
        const baserowMemberId = ctx.context.baserowMemberId;
        const baserowMemberName = ctx.context.baserowMemberName;

        if (!newSession?.user || !baserowMemberId) {
          return;
        }

        const userId = newSession.user.id;
        const memberId = parseInt(baserowMemberId as string);

        console.log(`[Auth] Linking user ${userId} to Baserow member ${memberId}`);

        try {
          // Update user in Postgres with Baserow member ID and name from Baserow
          await db.update(userTable).set({
            baserowMemberId: memberId.toString(),
            name: baserowMemberName as string,
          }).where(eq(userTable.id, userId));

          // Update member in Baserow with Portal ID
          await updateMemberPortalId(memberId, userId);

          console.log(`[Auth] Successfully linked user ${userId} to member ${memberId}`);
        } catch (error) {
          console.error('[Auth] Failed to link user to Baserow:', error);
          // Don't throw - user is already created, we can fix the link manually if needed
        }
      }
    }),
  },
})
