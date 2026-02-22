/**
 * packages/core/src/db/schema/members.ts
 *
 * Reader/subscriber accounts — completely separate auth namespace from
 * admin users. Magic link is always available; social login optional per-site.
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  uniqueIndex,
  index,
  decimal,
} from "drizzle-orm/mysql-core";
import {
  id,
  createdAt,
  updatedAt,
  deletedAt,
  siteIdCol,
  memberStatusEnum,
  subscriptionStatusEnum,
  subscriptionIntervalEnum,
} from "./helpers.js";
import { sites } from "./sites.js";

// ---------------------------------------------------------------------------
// Members (readers / subscribers)
// ---------------------------------------------------------------------------

export const members = mysqlTable(
  "members",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    avatar: text("avatar"),
    status: memberStatusEnum.notNull().default("active"),
    /** True when email address has been verified */
    email_verified: boolean("email_verified").default(false).notNull(),
    /** Whether the member is subscribed to the publication email list */
    subscribed: boolean("subscribed").default(true).notNull(),
    /** Note written by admin */
    note: text("note"),
    last_seen_at: timestamp("last_seen_at"),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: deletedAt(),
  },
  (t) => ({
    siteEmailIdx: uniqueIndex("members_site_email_unique").on(
      t.site_id,
      t.email
    ),
    siteStatusIdx: index("members_site_status").on(t.site_id, t.status),
  })
);

// ---------------------------------------------------------------------------
// Member magic-link auth tokens
// ---------------------------------------------------------------------------

export const memberAuthTokens = mysqlTable(
  "member_auth_tokens",
  {
    id: id(),
    member_id: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    /** SHA-256 hash of the raw token. The raw token is sent by email only. */
    token_hash: varchar("token_hash", { length: 64 }).notNull(),
    expires_at: timestamp("expires_at").notNull(),
    used_at: timestamp("used_at"),
    created_at: createdAt(),
  },
  (t) => ({
    tokenHashIdx: uniqueIndex("member_auth_tokens_hash_unique").on(
      t.token_hash
    ),
    memberIdx: index("member_auth_tokens_member_id").on(t.member_id),
  })
);

// ---------------------------------------------------------------------------
// Member sessions
// ---------------------------------------------------------------------------

export const memberSessions = mysqlTable(
  "member_sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    member_id: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull(),
    expires_at: timestamp("expires_at").notNull(),
    ip_address: varchar("ip_address", { length: 64 }),
    user_agent: text("user_agent"),
    created_at: createdAt(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("member_sessions_token_unique").on(t.token),
    memberIdx: index("member_sessions_member_id").on(t.member_id),
  })
);

// ---------------------------------------------------------------------------
// Membership tiers
// ---------------------------------------------------------------------------

export const tiers = mysqlTable(
  "tiers",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    /** Monthly price in cents */
    monthly_price_cents: int("monthly_price_cents"),
    /** Annual price in cents */
    yearly_price_cents: int("yearly_price_cents"),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    /** Benefits list (JSON array of strings) */
    benefits: text("benefits"),
    active: boolean("active").default(true).notNull(),
    /** Provider-specific product/price IDs */
    stripe_product_id: varchar("stripe_product_id", { length: 255 }),
    stripe_monthly_price_id: varchar("stripe_monthly_price_id", {
      length: 255,
    }),
    stripe_yearly_price_id: varchar("stripe_yearly_price_id", { length: 255 }),
    trial_days: int("trial_days").default(0).notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    siteSlugIdx: uniqueIndex("tiers_site_slug_unique").on(t.site_id, t.slug),
    siteIdx: index("tiers_site_id").on(t.site_id),
  })
);

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    member_id: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    tier_id: varchar("tier_id", { length: 36 })
      .notNull()
      .references(() => tiers.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum.notNull(),
    interval: subscriptionIntervalEnum.notNull(),
    /** Provider-specific subscription ID */
    provider_subscription_id: varchar("provider_subscription_id", {
      length: 255,
    }),
    /** Provider-specific customer ID */
    provider_customer_id: varchar("provider_customer_id", { length: 255 }),
    current_period_start: timestamp("current_period_start"),
    current_period_end: timestamp("current_period_end"),
    cancel_at_period_end: boolean("cancel_at_period_end")
      .default(false)
      .notNull(),
    canceled_at: timestamp("canceled_at"),
    trial_start: timestamp("trial_start"),
    trial_end: timestamp("trial_end"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    memberIdx: index("subscriptions_member_id").on(t.member_id),
    siteIdx: index("subscriptions_site_id").on(t.site_id),
    providerIdIdx: index("subscriptions_provider_id").on(
      t.provider_subscription_id
    ),
    statusIdx: index("subscriptions_status").on(t.site_id, t.status),
  })
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type MemberAuthToken = typeof memberAuthTokens.$inferSelect;
export type Tier = typeof tiers.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
