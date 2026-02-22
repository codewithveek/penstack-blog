/**
 * apps/api/src/handlers/webhook.handler.ts
 *
 * Two concerns handled here:
 *  1. Admin CRUD for webhook definitions (list, get, create, update, delete, list-deliveries)
 *  2. Public inbound webhook endpoint for payment providers (/webhooks/payment)
 *     — raw body must be preserved for signature verification
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  createWebhookSchema,
  updateWebhookSchema,
} from "@cms/core/validators/webhook";
import { logger } from "../lib/logger";
import type { WebhookController } from "../controllers/webhook.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

const listDeliveriesParamSchema = z.object({ id: z.string().uuid() });

export function createWebhookHandler(controller: WebhookController) {
  const app = new Hono();

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  app.get("/", zValidator("query", listQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const { page, limit } = c.req.valid("query");
      const result = await controller.list(siteId, { page, limit });
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("WEBHOOK list failed", err);
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
      const webhook = await controller.getById(siteId, id);
      return c.json({ data: webhook });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("WEBHOOK getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createWebhookSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const webhook = await controller.create(siteId, {
        targetUrl: input.target_url,
        events: input.event_triggers,
      });
      return c.json({ data: webhook }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("WEBHOOK create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateWebhookSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const webhook = await controller.update(siteId, id, {
          ...(input.target_url !== undefined && {
            targetUrl: input.target_url,
          }),
          ...(input.event_triggers !== undefined && {
            events: input.event_triggers,
          }),
          ...(input.active !== undefined && { active: input.active }),
        });
        return c.json({ data: webhook });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("WEBHOOK update failed", err);
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
      logger.error("WEBHOOK delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // ── Delivery log ───────────────────────────────────────────────────────────

  app.get(
    "/:id/deliveries",
    zValidator("param", listDeliveriesParamSchema),
    zValidator("query", listQuerySchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const { page, limit } = c.req.valid("query");
        const result = await controller.listDeliveries(siteId, id, {
          page,
          limit,
        });
        return c.json({ data: result.data, meta: result.meta });
      } catch (err) {
        if (isAppError(err))
          return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
        logger.error("WEBHOOK list-deliveries failed", err);
        return c.json(
          {
            error: { code: "INTERNAL_ERROR", message: "Internal server error" },
          },
          500
        );
      }
    }
  );

  return app;
}
