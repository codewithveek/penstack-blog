/**
 * apps/api/src/handlers/settings.handler.ts
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  updateSiteSettingsSchema,
  createApiKeySchema,
} from "@cms/core/validators/webhook";
import { logger } from "../lib/logger";
import type { SettingsController } from "../controllers/settings.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export function createSettingsHandler(controller: SettingsController) {
  const app = new Hono();

  // ── Site settings ──────────────────────────────────────────────────────────

  app.get("/", async (c) => {
    try {
      const siteId = c.get("siteId");
      const settings = await controller.getSiteSettings(siteId);
      return c.json({ data: settings });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("SETTINGS get failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch("/", zValidator("json", updateSiteSettingsSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const settings = await controller.updateSiteSettings(siteId, input);
      return c.json({ data: settings });
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 422 | 500
        );
      logger.error("SETTINGS update failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // ── API keys ───────────────────────────────────────────────────────────────

  app.get("/api-keys", zValidator("query", listQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { page, limit } = c.req.valid("query");
      const result = await controller.listApiKeys(siteId, { page, limit });
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("SETTINGS list-api-keys failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/api-keys", zValidator("json", createApiKeySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { name, role } = c.req.valid("json");
      // rawKey shown once — caller must store it; only the hash is persisted
      const { apiKey, rawKey } = await controller.createApiKey(
        siteId,
        name,
        role
      );
      return c.json({ data: { apiKey, rawKey } }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("SETTINGS create-api-key failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.delete("/api-keys/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { id } = c.req.valid("param");
      await controller.revokeApiKey(siteId, id);
      return c.body(null, 204);
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("SETTINGS revoke-api-key failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
