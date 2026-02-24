/**
 * packages/core/src/db/schema/index.ts
 *
 * Barrel export for all schema tables and types.
 * Imported by the DB client and by Drizzle Kit (drizzle.config.ts).
 */

// Sites
export * from "./sites.sql.js";

// Users and auth session tables
export * from "./users.sql.js";

// Content
export * from "./posts.sql.js";

// Members (readers)
export * from "./members.sql.js";

// Newsletters and email
export * from "./newsletters.sql.js";

// Settings, API keys, webhooks, redirects, auth settings
export * from "./settings.sql.js";

// Media
export * from "./media.sql.js";
