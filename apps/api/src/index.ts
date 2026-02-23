/**
 * apps/api/src/index.ts
 *
 * API server entry point.
 *
 * Hono app is served via @hono/node-server.
 * All routes are mounted under the path prefix `/api` so the app can be
 * proxied behind a Next.js rewrite at `/api/[[...route]]` when deployed
 * as a monorepo, or run standalone on its own port.
 *
 * Startup order:
 *   1. Create Hono app
 *   2. Register global middleware (logger, CORS, HSTS)
 *   3. Mount all API routes (via routes/index.ts)
 *   4. Register 404 catch-all
 *   5. Start node-server
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { router } from "./routes/index";
import { logger } from "./lib/logger";
import { isAppError } from "@cms/core/errors";

// ── App ───────────────────────────────────────────────────────────────────────

const app = new Hono();

// ── Global middleware ─────────────────────────────────────────────────────────

// HTTP request logger
app.use("*", loggerMiddleware);

// CORS — allow the configured web origin; credentials required for cookie auth
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = process.env.WEB_ORIGIN ?? "http://localhost:3000";
      if (!origin) return allowed; // Same-origin / non-browser requests
      if (origin === allowed) return origin;
      // Allow all subdomains of the platform domain in production
      const platformDomain = process.env.PLATFORM_DOMAIN;
      if (platformDomain && origin.endsWith(`.${platformDomain}`))
        return origin;
      return null; // Reject
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-CMS-Site-ID"],
    exposeHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
    credentials: true,
    maxAge: 86400,
  })
);

// HSTS — per AGENTS.md §11: Strict-Transport-Security on all responses
app.use("*", async (c, next) => {
  await next();
  if (process.env.NODE_ENV === "production") {
    c.res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Mount all API routes.
// The router in routes/index.ts handles /setup, /admin/v1, /content/v1, /member/auth.
// The prefix /api is stripped by the reverse-proxy or Next.js rewrite before reaching here.
app.route("/", router);

// Better Auth handles its own routes at /api/auth/** via the Better Auth handler.
// Import auth from lib/auth and mount it for admin authentication.
app.on(["GET", "POST"], "/auth/**", async (c) => {
  const { auth } = await import("./lib/auth");
  return auth.handler(c.req.raw);
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404
  );
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.onError((err, c) => {
  // Typed AppErrors (rate-limit, auth, validation, etc.) carry their own HTTP
  // status — honour it here so they don't get swallowed as 500s.
  if (isAppError(err)) {
    return c.json(
      { error: err.toJSON() },
      err.httpStatus as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500
    );
  }
  logger.error("Unhandled error reached top-level handler", {
    method: c.req.method,
    path: c.req.path,
    error: err instanceof Error ? err.message : String(err),
  });
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500
  );
});

// ── Background workers ────────────────────────────────────────────────────────

const redisUrl = process.env.REDIS_URL;
if (redisUrl && process.env.ENABLE_WORKERS !== "false") {
  import("./workers/index").then(({ startAllWorkers }) => {
    startAllWorkers(redisUrl);
    logger.info("Background workers started");
  }).catch((err) => {
    logger.error("Failed to start background workers", {
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

// ── Start server ──────────────────────────────────────────────────────────────

const port = parseInt(process.env.API_PORT ?? "4000", 10);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`API server listening on http://localhost:${info.port}`);
  }
);

export default app;
export type AppType = typeof app;
