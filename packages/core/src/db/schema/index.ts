/**
 * packages/core/src/db/schema/index.ts
 *
 * Barrel export for all schema tables and types.
 * Imported by the DB client and by Drizzle Kit (drizzle.config.ts).
 */

// Sites
export * from "./sites.sql";

// Users and auth session tables
export * from "./users.sql";

// Content
export * from "./posts.sql";

// Members (readers)
export * from "./members.sql";

// Newsletters and email
export * from "./newsletters.sql";

// Settings, API keys, webhooks, redirects, auth settings
export * from "./settings.sql";

// Media
export * from "./media.sql";
