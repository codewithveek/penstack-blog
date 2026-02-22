/**
 * apps/api/src/handlers/user.handler.ts
 *
 * Admin user management. Role restrictions:
 *  - Create / delete: owner only (requireRole enforced at route level in routes/index.ts)
 *  - Update / list / get: admin+
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import { createUserSchema, updateUserSchema } from "@cms/core/validators/auth";
import { logger } from "../lib/logger";
import type { UserController } from "../controllers/user.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export function createUserHandler(controller: UserController) {
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
      logger.error("USER list failed", err);
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
      const user = await controller.getById(siteId, id);
      return c.json({ data: user });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("USER getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createUserSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const user = await controller.create(siteId, {
        email: input.email,
        name: input.name,
        role: input.role,
        avatarUrl: input.avatar ?? undefined,
        bio: input.bio ?? undefined,
      });
      return c.json({ data: user }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("USER create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateUserSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const user = await controller.update(siteId, id, {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.role !== undefined && { role: input.role }),
          ...(input.avatar !== undefined && { avatarUrl: input.avatar }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.website !== undefined && { website: input.website }),
          ...(input.twitter !== undefined && { twitter: input.twitter }),
        });
        return c.json({ data: user });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("USER update failed", err);
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
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 403 | 404 | 500
        );
      logger.error("USER delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
