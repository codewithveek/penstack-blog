/**
 * apps/api/src/lib/auth.ts
 *
 * Better Auth server instance.
 * https://www.better-auth.com
 *
 * Per AGENTS.md §8:
 *  - Admin auth and member auth are completely separate session namespaces.
 *  - An admin session cannot be used to access member-only content.
 *  - Magic link is always available and cannot be disabled.
 *  - Social login is opt-in per site via site_auth_settings (off by default).
 *  - JWTs: access tokens 15 min, refresh tokens 7 days.
 *  - Sessions stored in HTTP-only, SameSite=Strict cookies.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@cms/core/db/client";
import * as schema from "@cms/core/db/schema";

export const auth = betterAuth({
  basePath: "/api/auth",

  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // re-issue session cookie daily if still active
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 min client-side cache
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "cms_admin",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3100",
  ],

  plugins: [],
});

export type Auth = typeof auth;
export type AdminSession = Awaited<ReturnType<typeof auth.api.getSession>>;
