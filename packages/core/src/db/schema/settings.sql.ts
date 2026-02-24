/**
 * packages/core/src/db/schema/settings.ts
 *
 * Platform-wide settings (keyed globally) and per-site settings
 * (keyed by site_id + key). Also covers API keys, webhooks,
 * redirects, and per-site auth configuration.
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/mysql-core";
import {
  id,
  createdAt,
  updatedAt,
  siteIdCol,
  apiKeyRoleEnum,
  webhookStatusEnum,
  redirectTypeEnum,
} from "./helpers.sql.js";
import { sites } from "./sites.sql.js";
import { members } from "./members.sql.js";

// ---------------------------------------------------------------------------
// Platform settings (global key-value)
// ---------------------------------------------------------------------------

export const platformSettings = mysqlTable("platform_settings", {
  key: varchar("key", { length: 255 }).primaryKey().notNull(),
  value: text("value"),
  description: text("description"),
  encrypted: boolean("encrypted").default(false).notNull(),
  updated_at: updatedAt(),
});

// ---------------------------------------------------------------------------
// Site settings (per-site key-value)
// Contains: permalink_pattern, user:{id}:autosave_enabled, etc.
// ---------------------------------------------------------------------------

export const siteSettings = mysqlTable(
  "site_settings",
  {
    site_id: varchar("site_id", { length: 36 })
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value"),
    encrypted: boolean("encrypted").default(false).notNull(),
    updated_at: updatedAt(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.site_id, t.key] }),
    siteIdx: index("site_settings_site_id").on(t.site_id),
  })
);

// ---------------------------------------------------------------------------
// API keys (content key = public, admin key = private)
// ---------------------------------------------------------------------------

export const apiKeys = mysqlTable(
  "api_keys",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    role: apiKeyRoleEnum.notNull(),
    /** Only a 8-char prefix is stored for display: cms_live_XXXXXXXX */
    key_prefix: varchar("key_prefix", { length: 32 }).notNull(),
    /** SHA-256 + per-key salt hash of the full key */
    key_hash: varchar("key_hash", { length: 128 }).notNull(),
    key_salt: varchar("key_salt", { length: 64 }).notNull(),
    last_used_at: timestamp("last_used_at"),
    revoked_at: timestamp("revoked_at"),
    created_at: createdAt(),
  },
  (t) => ({
    siteRoleIdx: index("api_keys_site_role").on(t.site_id, t.role),
    keyHashIdx: uniqueIndex("api_keys_hash_unique").on(t.key_hash),
  })
);

// ---------------------------------------------------------------------------
// Webhooks and delivery logs
// ---------------------------------------------------------------------------

export const webhooks = mysqlTable(
  "webhooks",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    target_url: text("target_url").notNull(),
    /** Comma-separated event names: "post.published,member.created" */
    event_triggers: text("event_triggers").notNull(),
    /** HMAC-SHA256 signing secret (stored encrypted) */
    secret: text("secret").notNull(),
    active: boolean("active").default(true).notNull(),
    created_at: createdAt(),
  },
  (t) => ({
    siteIdx: index("webhooks_site_id").on(t.site_id),
  })
);

export const webhookDeliveries = mysqlTable(
  "webhook_deliveries",
  {
    id: id(),
    webhook_id: varchar("webhook_id", { length: 36 })
      .notNull()
      .references(() => webhooks.id, { onDelete: "cascade" }),
    event_type: varchar("event_type", { length: 255 }).notNull(),
    payload: text("payload").notNull(),
    status: webhookStatusEnum.notNull().default("pending"),
    http_status: varchar("http_status", { length: 4 }),
    response_body: text("response_body"),
    attempt_count: varchar("attempt_count", { length: 4 })
      .notNull()
      .default("0"),
    next_attempt_at: timestamp("next_attempt_at"),
    delivered_at: timestamp("delivered_at"),
    created_at: createdAt(),
  },
  (t) => ({
    webhookStatusIdx: index("webhook_deliveries_webhook_status").on(
      t.webhook_id,
      t.status
    ),
    nextAttemptIdx: index("webhook_deliveries_next_attempt").on(
      t.next_attempt_at
    ),
  })
);

// ---------------------------------------------------------------------------
// Redirects (auto-created on permalink pattern change)
// ---------------------------------------------------------------------------

export const redirects = mysqlTable(
  "redirects",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    from_path: varchar("from_path", { length: 2048 }).notNull(),
    to_path: varchar("to_path", { length: 2048 }).notNull(),
    type: redirectTypeEnum.notNull().default("301"),
    active: boolean("active").default(true).notNull(),
    created_at: createdAt(),
  },
  (t) => ({
    siteFromPathIdx: uniqueIndex("redirects_site_from_path_unique").on(
      t.site_id,
      t.from_path
    ),
    siteIdx: index("redirects_site_id").on(t.site_id),
  })
);

// ---------------------------------------------------------------------------
// Per-site auth settings (OAuth credentials per provider, encrypted at rest)
// ---------------------------------------------------------------------------

export const siteAuthSettings = mysqlTable("site_auth_settings", {
  site_id: varchar("site_id", { length: 36 })
    .primaryKey()
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  /** Magic link always on — these flags control social providers */
  google_enabled: boolean("google_enabled").default(false).notNull(),
  google_client_id: text("google_client_id"),
  google_client_secret: text("google_client_secret"),
  facebook_enabled: boolean("facebook_enabled").default(false).notNull(),
  facebook_app_id: text("facebook_app_id"),
  facebook_app_secret: text("facebook_app_secret"),
  /** Allow social login for admin users (in addition to members) */
  allow_social_for_admins: boolean("allow_social_for_admins")
    .default(false)
    .notNull(),
  allow_social_for_members: boolean("allow_social_for_members")
    .default(true)
    .notNull(),
  updated_at: updatedAt(),
});

// ---------------------------------------------------------------------------
// Platform setup status
// ---------------------------------------------------------------------------

export const platformSetupStatus = mysqlTable("platform_setup_status", {
  id: id(),
  is_completed: boolean("is_completed").default(false).notNull(),
  completed_at: timestamp("completed_at"),
  setup_version: varchar("setup_version", { length: 32 }),
  created_at: createdAt(),
  updated_at: updatedAt(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;
export type SiteAuthSettings = typeof siteAuthSettings.$inferSelect;
