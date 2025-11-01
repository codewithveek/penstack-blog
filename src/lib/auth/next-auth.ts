import "server-only";
import "dotenv/config";
import { type AuthOptions, getServerSession } from "next-auth";
import { eq, or, and } from "drizzle-orm";
import { type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { roles, users } from "@/db/schemas";
import {
  JWT,
  encode,
  decode,
  JWTDecodeParams,
  JWTEncodeParams,
} from "next-auth/jwt";
import { TPermissions, UserInsert } from "@/types";
import { getUser, getUserWithPermissions } from "../queries/get-user";

interface CustomUser extends User {
  id: string;
  role_id: number;
  auth_type: UserInsert["auth_type"];
  username: string;
  avatar: string;
  permissions: TPermissions[]; // Added permissions property
}

/**
 * Normalize email to lowercase for consistent comparison
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
async function getSubscriberRoleId(): Promise<number> {
  const subscriberRole = await db.query.roles.findFirst({
    where: eq(roles.name, "subscriber"),
  });
  return subscriberRole?.id as number;
}
/**
 * Check if a user can authenticate with the given provider
 * @returns Error message string if authentication should be denied, false if allowed
 */
function checkUserAuthType(
  user: { auth_type: string; email: string },
  provider: "google" | "github" | "credentials"
): string | false {
  if (user.auth_type === "local" && provider !== "credentials") {
    return "This email is already registered with a password. Please sign in with your password.";
  }
  if (provider === "credentials" && user.auth_type !== "local") {
    return `This email is already registered with ${user.auth_type}. Please sign in with ${user.auth_type}.`;
  }
  if (provider !== "credentials" && user.auth_type !== provider) {
    return `This email is already registered with ${user.auth_type}. Please sign in with ${user.auth_type}.`;
  }
  return false;
}

/**
 * Find an existing user by email across all authentication types
 */
async function findExistingUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
}

const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        const email = normalizeEmail(profile.email);
        const roleId = await getSubscriberRoleId();
        return {
          id: profile.sub,
          name: profile.name,
          email: email,
          avatar: profile.picture,
          username: profile.email.split("@")[0],
          auth_type: "google",
          role_id: roleId,
          image: profile.picture,
        } as CustomUser;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      async profile(profile) {
        // Check if email exists before accessing it
        const email = profile.email ? normalizeEmail(profile.email) : "";
        if (!email) {
          throw new Error(
            "Email is required. Please add a public email to your GitHub profile."
          );
        }
        const roleId = await getSubscriberRoleId();

        return {
          id: profile.id?.toString(),
          name: profile.name || profile.login,
          email: email,
          avatar: profile.avatar_url,
          username: profile.login,
          auth_type: "github",
          role_id: roleId,
          image: profile?.avatar_url,
        } as CustomUser;
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await getUserWithPermissions(credentials.emailOrUsername);
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          name: user.name,
          email: user.email,
          id: user?.auth_id,
          image: user.avatar as string,
          role_id: user.role_id,
          permissions: user.permissions,
          auth_type: "local",
          username: user.username,
        } as CustomUser;
      },
    }),
  ],
  jwt: {
    async encode(params: JWTEncodeParams): Promise<string> {
      if (!params.token) {
        throw new Error("Token is undefined");
      }
      return await encode({
        token: params.token,
        secret: params.secret,
        maxAge: params.maxAge,
      });
    },
    async decode(params: JWTDecodeParams): Promise<JWT | null> {
      if (!params.token) {
        return null;
      }
      return await decode({
        secret: params.secret,
        token: params.token,
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const normalizedEmail = normalizeEmail(user.email);
      const existingUser = await findExistingUserByEmail(normalizedEmail);

      if (existingUser) {
        // Check if trying to sign in with a different provider
        const authTypeCheck = checkUserAuthType(
          {
            auth_type: existingUser.auth_type as string,
            email: existingUser.email,
          },
          account?.provider as "google" | "github" | "credentials"
        );

        if (authTypeCheck) {
          throw new Error(authTypeCheck);
        }

        // Check email verification for credentials login
        if (
          account?.provider === "credentials" &&
          !existingUser.email_verified
        ) {
          throw new Error("Please verify your email before signing in");
        }

        return true;
      }

      // Create new user for OAuth providers
      if (!existingUser && account?.provider !== "credentials") {
        try {
          // Check for username uniqueness before creating user
          const usernameExists = await db.query.users.findFirst({
            where: eq(users.username, (user as CustomUser).username),
          });

          // Append random digits if username already exists
          let finalUsername = (user as CustomUser).username;
          if (usernameExists) {
            finalUsername = `${finalUsername}${Math.floor(Math.random() * 10000)}`;
          }
          const roleId = await getSubscriberRoleId();

          await db.insert(users).values({
            email: normalizedEmail,
            name: user.name,
            username: finalUsername,
            avatar: (user as CustomUser).avatar || user.image || "",
            auth_type: (user as CustomUser).auth_type,
            role_id: (user as CustomUser).role_id || roleId,
            auth_id: (user as CustomUser).id,
            email_verified: true, // OAuth providers are pre-verified
          });
          return true;
        } catch (error) {
          console.error("Error creating new user:", error);
          throw new Error("Failed to create account. Please try again later.");
        }
      }

      // User doesn't exist and trying to sign in with credentials
      throw new Error("Account not found. Please sign up.");
    },

    async jwt({ token, user, account }) {
      if (user) {
        return {
          ...token,
          id: user.id || (token.sub as string),
          role_id: (user as CustomUser).role_id,
          permissions: (user as CustomUser).permissions || [],
          auth_type: (user as CustomUser).auth_type,
        };
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role_id: token.role_id,
          permissions: token.permissions as TPermissions[],
          auth_type: token.auth_type,
        },
      };
    },
  },
};

const getSession = async () => await getServerSession(authOptions);

export { authOptions, getSession };
