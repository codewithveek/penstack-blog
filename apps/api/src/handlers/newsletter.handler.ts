/**
 * apps/api/src/handlers/newsletter.handler.ts
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  createNewsletterSchema,
  updateNewsletterSchema,
  sendTestEmailSchema,
} from "@cms/core/validators/newsletter";
import { logger } from "../lib/logger";
import type { NewsletterController } from "../controllers/newsletter.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export function createNewsletterHandler(controller: NewsletterController) {
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
      logger.error("NEWSLETTER list failed", err);
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
      const newsletter = await controller.getById(siteId, id);
      return c.json({ data: newsletter });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("NEWSLETTER getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createNewsletterSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const newsletter = await controller.create(siteId, {
        name: input.name,
        ...(input.description != null && { description: input.description }),
        senderName: input.sender_name ?? input.name,
        senderEmail: input.sender_email ?? "",
        ...(input.reply_to_email != null && { replyToEmail: input.reply_to_email }),
      });
      return c.json({ data: newsletter }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("NEWSLETTER create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateNewsletterSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const newsletter = await controller.update(siteId, id, {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.sender_name != null && { senderName: input.sender_name }),
          ...(input.sender_email != null && { senderEmail: input.sender_email }),
          ...(input.reply_to_email != null && { replyToEmail: input.reply_to_email }),
        });
        return c.json({ data: newsletter });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("NEWSLETTER update failed", err);
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
      logger.error("NEWSLETTER delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // Send a test email for a newsletter
  app.post(
    "/:id/test-email",
    zValidator("param", idParamSchema),
    zValidator("json", sendTestEmailSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
      const { to_email, subject, html } = c.req.valid("json");
      await controller.sendTest(siteId, id, to_email, subject, html);
        return c.json({ data: { message: "Test email queued" } });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("NEWSLETTER send-test-email failed", err);
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
