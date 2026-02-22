/**
 * packages/core/src/db/schema/sites.ts
 *
 * The top-level multi-tenant entity. Every other tenant-scoped table
 * carries a site_id FK pointing here.
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
import { id, createdAt, updatedAt } from "./helpers.js";

export const sites = mysqlTable(
  "sites",
  {
    id: id(),
    /** Globally unique slug used as subdomain: e.g. "acme" → acme.platform.com */
    slug: varchar("slug", { length: 63 }).notNull(),
    /** Human-readable publication name */
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    /** Custom domain (after verification): e.g. "acme.com" */
    custom_domain: varchar("custom_domain", { length: 255 }),
    custom_domain_verified: boolean("custom_domain_verified")
      .default(false)
      .notNull(),
    /** Theme slug resolved from the themes registry */
    theme: varchar("theme", { length: 255 }).default("default").notNull(),
    /** Whether the site setup wizard has been completed */
    setup_completed: boolean("setup_completed").default(false).notNull(),
    /** Timezone identifier, e.g. "America/New_York" */
    timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
    locale: varchar("locale", { length: 16 }).default("en").notNull(),
    favicon: text("favicon"),
    logo: text("logo"),
    cover_image: text("cover_image"),
    /** Stripe/payment customer ID — tenant-level billing */
    payment_customer_id: varchar("payment_customer_id", { length: 255 }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    slugUniqueIdx: uniqueIndex("sites_slug_unique").on(t.slug),
    customDomainUniqueIdx: uniqueIndex("sites_custom_domain_unique").on(
      t.custom_domain
    ),
  })
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
