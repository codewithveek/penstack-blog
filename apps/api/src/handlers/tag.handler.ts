/**
 * apps/api/src/handlers/tag.handler.ts
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  createTagSchema,
  updateTagSchema,
  listTagsQuerySchema,
} from "@cms/core/validators/tag";
import { logger } from "../lib/logger";
import type { TagController } from "../controllers/tag.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

export function createTagHandler(controller: TagController) {
  const app = new Hono();

  app.get("/", zValidator("query", listTagsQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const query = c.req.valid("query");
      const result = await controller.list(siteId, {
        page: query.page,
        limit: query.limit,
        ...(query.search !== undefined && { search: query.search }),
      });
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 400 | 500);
      logger.error("TAG list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.get("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      const tag = await controller.getById(siteId, id);
      return c.json({ data: tag });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("TAG getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createTagSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const tag = await controller.create(siteId, {
        name: input.name,
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description != null && { description: input.description }),
        ...(input.feature_image != null && {
          featureImage: input.feature_image,
        }),
      });
      return c.json({ data: tag }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("TAG create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateTagSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const tag = await controller.update(siteId, id, {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.feature_image !== undefined && {
            featureImage: input.feature_image,
          }),
        });
        return c.json({ data: tag });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 409 | 500
          );
        logger.error("TAG update failed", err);
        return c.json(
          {
            error: { code: "INTERNAL_ERROR", message: "Internal server error" },
          },
          500
        );
      }
    }
  );

  app.delete("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      await controller.delete(siteId, id);
      return c.body(null, 204);
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("TAG delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
