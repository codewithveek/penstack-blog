/**
 * packages/core/src/db/schema/helpers.ts
 *
 * Shared column definitions and constants reused across all schema files.
 */

import {
  varchar,
  timestamp,
  boolean,
  mysqlEnum,
  int,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Common column factories
// ---------------------------------------------------------------------------

/** Standard UUID primary key (varchar 36) */
export const id = () => varchar("id", { length: 36 }).primaryKey().notNull();

/** Timestamp set automatically on insert */
export const createdAt = () =>
  timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

/** Timestamp set automatically on insert and update */
export const updatedAt = () =>
  timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull();

/** Nullable soft-delete timestamp */
export const deletedAt = () => timestamp("deleted_at");

/** site_id FK column (resolved from JWT, never from client input) */
export const siteIdCol = () => varchar("site_id", { length: 36 }).notNull();

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export const postStatusEnum = mysqlEnum("status", [
  "draft",
  "published",
  "scheduled",
  "archived",
]);

export const postTypeEnum = mysqlEnum("type", ["post", "page"]);

export const postVisibilityEnum = mysqlEnum("visibility", [
  "public",
  "members",
  "paid",
]);

export const authorRoleEnum = mysqlEnum("role", [
  "primary",
  "co_author",
  "contributor",
]);

export const memberStatusEnum = mysqlEnum("status", [
  "active",
  "inactive",
  "banned",
]);

export const subscriptionStatusEnum = mysqlEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
]);

export const subscriptionIntervalEnum = mysqlEnum("interval", [
  "month",
  "year",
]);

export const apiKeyRoleEnum = mysqlEnum("api_key_role", ["content", "admin"]);

export const webhookStatusEnum = mysqlEnum("webhook_status", [
  "success",
  "failed",
  "pending",
]);

export const mediaTypeEnum = mysqlEnum("media_type", [
  "image",
  "video",
  "audio",
  "document",
  "other",
]);

export const redirectTypeEnum = mysqlEnum("redirect_type", ["301", "302"]);

export const siteAdminRoleEnum = mysqlEnum("site_role", [
  "super_admin",
  "owner",
  "admin",
  "editor",
  "author",
  "contributor",
]);

export const emailSendStatusEnum = mysqlEnum("email_send_status", [
  "queued",
  "sending",
  "sent",
  "failed",
]);

export const emailEventTypeEnum = mysqlEnum("email_event_type", [
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "complained",
  "unsubscribed",
]);

export const newsletterStatusEnum = mysqlEnum("newsletter_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
]);
