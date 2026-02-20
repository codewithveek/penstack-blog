import "server-only";
import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users, roles, session, account, verification } from "@/db/schemas";
import { IdGenerator } from "@/utils";

async function getSubscriberRoleId(): Promise<number> {
  const subscriberRole = await db.query.roles.findFirst({
    where: eq(roles.name, "subscriber"),
  });
  return subscriberRole?.id as number;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      Users: users,
      Session: session,
      Account: account,
      Verification: verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3025",
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async ({
        password,
        hash,
      }: {
        password: string;
        hash: string;
      }) => {
        return bcrypt.compare(password, hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    },
  },
  session: {
    modelName: "Session",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    fields: {
      image: "avatar",
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      role_id: {
        type: "number",
        required: false,
        input: false,
      },
      auth_type: {
        type: "string",
        required: false,
        defaultValue: "local",
        input: false,
      },
      username: {
        type: "string",
        required: false,
        input: false,
      },
      avatar: {
        type: "string",
        required: false,
        input: false,
      },
      auth_id: {
        type: "string",
        required: false,
        input: false,
      },
      bio: {
        type: "string",
        required: false,
        input: false,
      },
      title: {
        type: "string",
        required: false,
        input: false,
      },
      account_status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
    modelName: "Users",
  },
  account: {
    modelName: "Account",
  },
  advanced: {} as any,
  databaseHooks: {
    user: {
      create: {
        before: async (user: any) => {
          const email = normalizeEmail(user.email);
          const username = user.username || email.split("@")[0];
          const roleId = await getSubscriberRoleId();

          // Check for username uniqueness
          const usernameExists = await db.query.users.findFirst({
            where: eq(users.username, username),
          });

          const finalUsername = usernameExists
            ? `${username}${Math.floor(Math.random() * 10000)}`
            : username;

          return {
            data: {
              ...user,
              email,
              username: finalUsername,
              role_id: user.role_id || roleId,
              auth_id: user.auth_id || IdGenerator.bigIntId(),
              auth_type: user.auth_type || "local",
              account_status: "active",
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
