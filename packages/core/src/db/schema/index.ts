/**
 * packages/core/src/db/schema/index.ts
 *
 * Barrel export for all schema tables and types.
 * Imported by the DB client and by Drizzle Kit (drizzle.config.ts).
 */

// Sites
export * from "./sites.js";

// Users and auth session tables
export * from "./users.js";

// Content
export * from "./posts.js";

// Members (readers)
export * from "./members.js";

// Newsletters and email
export * from "./newsletters.js";

// Settings, API keys, webhooks, redirects, auth settings
export * from "./settings.js";

// Media
export * from "./media.js";
