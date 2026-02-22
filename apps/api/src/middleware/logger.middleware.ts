/**
 * apps/api/src/middleware/logger.middleware.ts
 *
 * Request/response logging middleware.
 */

import type { Context, Next } from "hono"
import { logger } from "../lib/logger"

export async function loggerMiddleware(c: Context, next: Next): Promise<void> {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path

  await next()

  const duration = Date.now() - start
  const status = c.res.status

  // Never log auth route bodies — only path and status
  if (path.includes("/auth")) {
    logger.info(`${method} ${path} ${status} ${duration}ms`)
  } else {
    logger.info(`${method} ${path} ${status} ${duration}ms`)
  }
}
