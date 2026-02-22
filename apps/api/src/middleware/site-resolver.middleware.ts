/**
 * apps/api/src/middleware/site-resolver.middleware.ts
 *
 * Resolves the current site from the Host header.
 * Injects siteId into the Hono context.
 * Handles setup redirect guard.
 *
 * Per AGENTS.md §9: siteId comes from Host header resolution, NOT from URL params.
 */

import type { Context, Next } from "hono"
import type { SiteService } from "../services/site.service"
import { logger } from "../lib/logger"

declare module "hono" {
  interface ContextVariableMap {
    siteId: string
    userId: string
    role: "owner" | "admin" | "editor" | "author" | "contributor"
    memberSessionToken: string
  }
}

export function createSiteResolverMiddleware(siteService: SiteService) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const host = c.req.header("host") ?? c.req.header("x-forwarded-host") ?? ""
    const hostname = host.split(":")[0] ?? host

    // Internal health/setup routes — no site resolution needed
    if (c.req.path.startsWith("/api/_internal") || c.req.path.startsWith("/api/setup")) {
      await next()
      return
    }

    const site = await siteService.getByHost(hostname).catch((err) => {
      logger.error("Site resolution failed", err, { hostname })
      return null
    })

    if (!site) {
      return c.json({ error: { code: "SITE_NOT_FOUND", message: "Site not found" } }, 404)
    }

    if (!site.setup_completed && !c.req.path.startsWith("/api/setup")) {
      return c.json(
        { error: { code: "SETUP_REQUIRED", message: "Site setup has not been completed" } },
        503
      )
    }

    c.set("siteId", site.id)
    await next()
  }
}
