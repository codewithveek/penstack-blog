/**
 * apps/api/src/handlers/post.handler.ts
 *
 * HTTP layer for post/page CRUD and lifecycle operations.
 * All validation with zValidator; all errors mapped to HTTP codes.
 * Per AGENTS.md §7: handlers are HTTP-aware, controllers are not.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
} from "@cms/core/validators/post";
import { logger } from "../lib/logger";
import type { PostController } from "../controllers/post.controller";

const idParamSchema = z.object({ id: z.string().uuid() });
const slugParamSchema = z.object({ slug: z.string().min(1) });

export function createPostHandler(controller: PostController) {
  const app = new Hono();

  // List posts
  app.get("/", zValidator("query", listPostsQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const query = c.req.valid("query");
      const result = await controller.list(siteId, query);
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500
        );
      logger.error("POST list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Get by slug
  app.get("/slug/:slug", zValidator("param", slugParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { slug } = c.req.valid("param");
      const post = await controller.getBySlug(siteId, slug);
      return c.json({ data: post });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("POST getBySlug failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Get by ID
  app.get("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      const post = await controller.getById(siteId, id);
      return c.json({ data: post });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("POST getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Create post
  app.post("/", zValidator("json", createPostSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const userId = c.get("userId");
      const input = c.req.valid("json");
      const post = await controller.create(siteId, userId, input);
      return c.json({ data: post }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 401 | 403 | 409 | 422 | 500
        );
      logger.error("POST create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Update post
  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updatePostSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const post = await controller.update(siteId, id, input);
        return c.json({ data: post });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("POST update failed", err);
        return c.json(
          {
            error: { code: "INTERNAL_ERROR", message: "Internal server error" },
          },
          500
        );
      }
    }
  );

  // Publish post
  app.post("/:id/publish", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      const post = await controller.publish(siteId, id);
      return c.json({ data: post });
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 404 | 422 | 500
        );
      logger.error("POST publish failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Unpublish post
  app.post("/:id/unpublish", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      const post = await controller.unpublish(siteId, id);
      return c.json({ data: post });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("POST unpublish failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Schedule post
  app.post(
    "/:id/schedule",
    zValidator("param", idParamSchema),
    zValidator("json", z.object({ scheduled_at: z.coerce.date() })),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const { scheduled_at } = c.req.valid("json");
        const post = await controller.schedule(siteId, id, scheduled_at);
        return c.json({ data: post });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("POST schedule failed", err);
        return c.json(
          {
            error: { code: "INTERNAL_ERROR", message: "Internal server error" },
          },
          500
        );
      }
    }
  );

  // Delete post
  app.delete("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      await controller.delete(siteId, id);
      return c.body(null, 204);
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("POST delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
