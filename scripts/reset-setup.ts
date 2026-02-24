/**
 * scripts/reset-setup.ts
 *
 * Resets the setup state by clearing all data from the database.
 * This allows the setup wizard to run again with the fixed password flow.
 *
 * Usage: npx tsx --env-file=.env scripts/reset-setup.ts
 */

import { db } from "@cms/core/db/client";
import { sql } from "drizzle-orm";

async function resetSetup() {
  console.log("Resetting setup data...");

  // Disable FK checks temporarily for clean truncation
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

  // Delete from all tables in dependency order
  const tables = [
    "post_authors",
    "post_tags",
    "post_revisions",
    "posts",
    "tags",
    "redirects",
    "webhooks",
    "webhook_deliveries",
    "api_keys",
    "newsletter_subscribers",
    "newsletters",
    "member_sessions",
    "member_subscriptions",
    "members",
    "tiers",
    "site_auth_settings",
    "site_settings",
    "accounts",
    "sessions",
    "verifications",
    "users",
    "sites",
  ];

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`DELETE FROM \`${table}\``));
      console.log(`  Cleared: ${table}`);
    } catch (err) {
      // Table might not exist yet
      console.log(`  Skipped: ${table} (may not exist)`);
    }
  }

  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  console.log("\nSetup data cleared. You can now run the setup wizard again.");
  process.exit(0);
}

resetSetup().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
