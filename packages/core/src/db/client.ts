/**
 * packages/core/src/db/client.ts
 *
 * The ONLY file that connects to the database.
 * This export is intentionally NOT re-exported from @cms/core's barrel imports
 * so that only repository files (which import directly from @cms/core/db/client)
 * have database access. Services and above must never import from here.
 */

import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

function getConnectionUri(): string {
  const {
    DATABASE_URL,
    DB_HOST,
    DB_PORT,
    DB_USER_NAME,
    DB_USER_PASS,
    DB_NAME,
  } = process.env;

  if (DATABASE_URL) {
    return DATABASE_URL;
  }

  if (!DB_HOST || !DB_USER_NAME || !DB_USER_PASS || !DB_NAME) {
    throw new Error(
      "Database configuration is incomplete. Provide DATABASE_URL or " +
        "DB_HOST, DB_USER_NAME, DB_USER_PASS, DB_NAME environment variables."
    );
  }

  const sslParam = process.env["DB_SSL_CONFIG"]
    ? encodeURIComponent(process.env["DB_SSL_CONFIG"])
    : "true";
  const port = DB_PORT ?? "3306";
  return `mysql://${DB_USER_NAME}:${DB_USER_PASS}@${DB_HOST}:${port}/${DB_NAME}?ssl=${sslParam}`;
}

const connectionUri = getConnectionUri();

/**
 * The Drizzle ORM db instance.
 * Import path: @cms/core/db/client
 * FORBIDDEN outside of repository files.
 */
export const db = drizzle(connectionUri, {
  mode: "planetscale",
  schema,
  logger: process.env["NODE_ENV"] === "development",
});

export type DB = typeof db;
