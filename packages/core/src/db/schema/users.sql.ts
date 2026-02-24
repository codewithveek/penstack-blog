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
import {
  id,
  createdAt,
  updatedAt,
  deletedAt,
  siteIdCol,
  siteAdminRoleEnum,
} from "./helpers.sql.js";
import { sites } from "./sites.sql.js";

export const users = mysqlTable(
  "users",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    /** bcrypt hash. Null for OAuth-only accounts. */
    password_hash: text("password_hash"),
    /** URL-safe unique identifier shown publicly on author pages */
    slug: varchar("slug", { length: 255 }).notNull(),
    role: siteAdminRoleEnum.notNull().default("contributor"),
    bio: text("bio"),
    /** Profile photo URL */
    avatar: text("avatar"),
    cover_image: text("cover_image"),
    website: varchar("website", { length: 2048 }),
    twitter: varchar("twitter", { length: 255 }),
    facebook: varchar("facebook", { length: 255 }),
    location: varchar("location", { length: 255 }),
    email_verified: boolean("email_verified").default(false).notNull(),
    /** Whether this user is the platform super_admin (crosses site boundaries) */
    is_super_admin: boolean("is_super_admin").default(false).notNull(),
    last_login_at: timestamp("last_login_at"),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: deletedAt(),
  },
  (t) => ({
    siteEmailIdx: uniqueIndex("users_site_email_unique").on(t.site_id, t.email),
    siteSlugIdx: uniqueIndex("users_site_slug_unique").on(t.site_id, t.slug),
    siteRoleIdx: index("users_site_role").on(t.site_id, t.role),
  })
);

// ---------------------------------------------------------------------------
// Better Auth session/account tables (platform-wide, no site_id)
// ---------------------------------------------------------------------------

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    user_id: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull(),
    expires_at: timestamp("expires_at").notNull(),
    ip_address: varchar("ip_address", { length: 64 }),
    user_agent: text("user_agent"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    tokenUniqueIdx: uniqueIndex("sessions_token_unique").on(t.token),
    userIdx: index("sessions_user_id").on(t.user_id),
  })
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: id(),
    user_id: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider_id: varchar("provider_id", { length: 64 }).notNull(),
    account_id: varchar("account_id", { length: 255 }).notNull(),
    access_token: text("access_token"),
    refresh_token: text("refresh_token"),
    id_token: text("id_token"),
    access_token_expires_at: timestamp("access_token_expires_at"),
    refresh_token_expires_at: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    providerAccountIdx: uniqueIndex("accounts_provider_account_unique").on(
      t.provider_id,
      t.account_id
    ),
    userIdx: index("accounts_user_id").on(t.user_id),
  })
);

export const verifications = mysqlTable(
  "verifications",
  {
    id: id(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expires_at: timestamp("expires_at").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    identifierIdx: index("verifications_identifier").on(t.identifier),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
