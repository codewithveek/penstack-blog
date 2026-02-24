/**
 * packages/core/src/db/schema/users.ts
 *
 * Admin / author accounts. Completely separate from member accounts (readers).
 * Each user belongs to exactly one site. Better Auth sessions reference user.id.
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import {
  id,
  createdAt,
  updatedAt,
  deletedAt,
  siteIdCol,
  siteAdminRoleEnum,
} from "./helpers.sql";
import { sites } from "./sites.sql";

/**
 * Users table — admin / author accounts.
 *
 * JS property names for Better Auth fields use camelCase (e.g. emailVerified)
 * while DB column names stay snake_case. CMS-specific fields retain
 * snake_case JS names since Better Auth doesn't access them.
 */
export const users = mysqlTable(
  "users",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    /** bcrypt hash. Null for OAuth-only accounts. Better Auth expects "password". */
    password: text("password_hash"),
    /** URL-safe unique identifier shown publicly on author pages */
    slug: varchar("slug", { length: 255 }).notNull(),
    role: siteAdminRoleEnum.notNull().default("contributor"),
    bio: text("bio"),
    /** Profile photo URL — also mapped as "image" for Better Auth */
    image: text("avatar"),
    cover_image: text("cover_image"),
    website: varchar("website", { length: 255 }),
    twitter: varchar("twitter", { length: 255 }),
    facebook: varchar("facebook", { length: 255 }),
    location: varchar("location", { length: 255 }),
    /** Better Auth field (camelCase) — DB column stays email_verified */
    emailVerified: boolean("email_verified").default(false).notNull(),
    /** Whether this user is the platform super_admin (crosses site boundaries) */
    is_super_admin: boolean("is_super_admin").default(false).notNull(),
    last_login_at: timestamp("last_login_at"),
    /** Better Auth fields (camelCase) — DB columns stay snake_case */
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
    deleted_at: deletedAt(),
  },
  (t) => ([ uniqueIndex("users_site_email_unique").on(t.site_id, t.email),
    uniqueIndex("users_site_slug_unique").on(t.site_id, t.slug),
    index("users_site_role").on(t.site_id, t.role),
  ])
);

// ---------------------------------------------------------------------------
// Better Auth session/account/verification tables (platform-wide, no site_id)
// All JS property names are camelCase for Better Auth compatibility.
// DB column names remain snake_case.
// ---------------------------------------------------------------------------

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 500 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
  },
  (t) => ([ uniqueIndex("sessions_token_unique").on(t.token),
    index("sessions_user_id").on(t.userId),
  ])
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
  },
  (t) => ([
   uniqueIndex("accounts_provider_account_unique").on(
      t.providerId,
      t.accountId
    ),
   index("accounts_user_id").on(t.userId),
  ])
);

export const verifications = mysqlTable(
  "verifications",
  {
    id: id(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
  },
  (t) => ([
 index("verifications_identifier").on(t.identifier),
  ])
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
