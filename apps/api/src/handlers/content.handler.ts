/**
 * apps/api/src/handlers/content.handler.ts
 *
 * Public **read-only** Content API endpoints that complement the existing
 * post and tag content routes already mounted on /content/v1.
 *
 * Mounts:
 *   GET /authors           — list all authors for the site
 *   GET /authors/:slug     — single author by slug (+ recent posts)
 *   GET /pages             — list published pages
 *   GET /pages/:slug       — single published page by slug
 *   GET /settings          — public site settings
 *   GET /tiers             — list active membership tiers
 *
 * Per AGENTS.md §7: handlers parse HTTP, validate with Zod, call controller,
 * return typed HTTP response — zero business logic.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import { listPostsQuerySchema } from "@cms/core/validators/post";
import { logger } from "../lib/logger";
import type { UserController } from "../controllers/user.controller";
import type { PostController } from "../controllers/post.controller";
import type { SettingsController } from "../controllers/settings.controller";
import type { MemberController } from "../controllers/member.controller";

// ── Shared param / query schemas ─────────────────────────────────────────────

const slugParamSchema = z.object({ slug: z.string().min(1) });
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

// ── Authors ──────────────────────────────────────────────────────────────────

export function createContentAuthorsHandler(controller: UserController) {
  const app = new Hono();

  app.get("/", zValidator("query", listQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { page, limit } = c.req.valid("query");
      const result = await controller.list(siteId, { page, limit });
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("CONTENT authors list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.get("/:slug", zValidator("param", slugParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { slug } = c.req.valid("param");
      const author = await controller.getBySlug(siteId, slug);
      return c.json({ data: author });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("CONTENT author getBySlug failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}

// ── Pages ────────────────────────────────────────────────────────────────────

/**
 * Read-only page listing. Pages are filtered to `type: 'page'` and
 * `status: 'published'` by the handler so the service always returns
 * only publicly-visible pages.
 */
export function createContentPagesHandler(controller: PostController) {
  const app = new Hono();

  app.get("/", zValidator("query", listQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { page, limit } = c.req.valid("query");
      const result = await controller.list(siteId, {
        page,
        limit,
        type: "page",
        status: "published",
        sort_by: "published_at",
        sort_order: "desc",
      });
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("CONTENT pages list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.get("/:slug", zValidator("param", slugParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { slug } = c.req.valid("param");
      const post = await controller.getBySlug(siteId, slug);
      return c.json({ data: post });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("CONTENT page getBySlug failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}

// ── Settings ─────────────────────────────────────────────────────────────────

/**
 * Public site settings (site name, description, logo, navigation, etc.).
 * No auth required — the data is intentionally public.
 */
export function createContentSettingsHandler(controller: SettingsController) {
  const app = new Hono();

  app.get("/", async (c) => {
    try {
      const siteId = c.get("siteId");
      const settings = await controller.getSiteSettings(siteId);
      return c.json({ data: settings });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("CONTENT settings get failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}

// ── Tiers ────────────────────────────────────────────────────────────────────

/**
 * Public membership tiers listing — used by the member portal to display
 * available plans and pricing.
 */
export function createContentTiersHandler(controller: MemberController) {
  const app = new Hono();

  app.get("/", async (c) => {
    try {
      const siteId = c.get("siteId");
      const tiers = await controller.getTiers(siteId);
      return c.json({ data: tiers });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("CONTENT tiers list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
