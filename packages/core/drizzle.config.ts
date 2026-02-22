import { defineConfig } from "drizzle-kit";

// Load env for migration scripts
const DATABASE_URL = process.env.DATABASE_URL;

function getConnectionUri(): string {
  if (DATABASE_URL) return DATABASE_URL;
  const { DB_HOST, DB_PORT, DB_USER_NAME, DB_USER_PASS, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER_NAME || !DB_USER_PASS || !DB_NAME) {
    throw new Error("Missing database environment variables for drizzle-kit");
  }
  return `mysql://${DB_USER_NAME}:${DB_USER_PASS}@${DB_HOST}:${DB_PORT ?? 3306}/${DB_NAME}?ssl=true`;
}

export default defineConfig({
  schema: ["./src/db/schema/*.ts"],
  dialect: "mysql",
  out: "./src/db/migrations",
  dbCredentials: { url: getConnectionUri() },
  verbose: true,
  strict: true,
});
