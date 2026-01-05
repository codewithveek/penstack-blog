import { drizzle } from "drizzle-orm/mysql2";
import mysql2 from "mysql2/promise";
import * as schema from "./schemas";
import isEmpty from "just-is-empty";
import "dotenv/config";

const requiredEnvVars = [
  "DB_NAME",
  "DB_PORT",
  "DB_USER_NAME",
  "DB_USER_PASS",
  "DB_HOST",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && isEmpty(process.env.DATABASE_URL)) {
    throw new Error(
      `Missing required environment variable: ${envVar}. Please check your .env file.`
    );
  }
}

const {
  DB_NAME,
  DB_PORT,
  DB_USER_NAME,
  DB_USER_PASS,
  DB_SSL_CONFIG,
  DB_HOST,
  DATABASE_URL,
} = process.env;

export const dbDetails = {
  DB_NAME,
  DB_PORT,
  DB_USER_NAME,
  DB_SSL_CONFIG,
  DB_USER_PASS,
  DB_HOST,
};

let sslConfig;
try {
  sslConfig = DB_SSL_CONFIG ? JSON.parse(DB_SSL_CONFIG) : undefined;
} catch (error) {
  console.error("Invalid DB_SSL_CONFIG format. Expected valid JSON.");
  sslConfig = { rejectUnauthorized: true };
}

export const connectionUri = isEmpty(DATABASE_URL)
  ? `mysql://${DB_USER_NAME}:${DB_USER_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?ssl=${JSON.stringify(sslConfig)}`
  : DATABASE_URL;

const poolConnection = mysql2.createPool({
  uri: connectionUri,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(poolConnection, { mode: "planetscale", schema });
