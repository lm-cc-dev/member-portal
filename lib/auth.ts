import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";

// The RAILWAY_PUBLIC_DOMAIN is not available at build time, which causes
// BETTER_AUTH_URL to be an invalid "https://".
// We'll provide a valid fallback for the build process and use the
// real URL at runtime when it's available.
const baseUrl =
  process.env.BETTER_AUTH_URL === "https://" || !process.env.BETTER_AUTH_URL
    ? "http://localhost:3000" // Fallback for build time
    : process.env.BETTER_AUTH_URL; // Runtime URL with domain

export const auth = betterAuth({
  baseURL: baseUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
