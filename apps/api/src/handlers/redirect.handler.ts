/**
 * apps/api/src/handlers/redirect.handler.ts
 *
 * Admin CRUD for URL redirects.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  createRedirectSchema,
  listRedirectsQuerySchema,
} from "@cms/core/validators/redirect";
import { logger } from "../lib/logger";
import type { RedirectController } from "../controllers/redirect.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

export function createRedirectHandler(controller: RedirectController) {
  const app = new Hono();

  app.get("/", zValidator("query", listRedirectsQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { page, limit } = c.req.valid("query");
      const result = await controller.list(siteId, { page, limit });
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("REDIRECT list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createRedirectSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const redirect = await controller.create(siteId, {
        from_path: input.from_path,
        to_path: input.to_path,
        type: input.type,
        active: input.active,
      });
      return c.json({ data: redirect }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("REDIRECT create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.delete("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      await controller.delete(siteId, id);
      return c.body(null, 204);
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("REDIRECT delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
