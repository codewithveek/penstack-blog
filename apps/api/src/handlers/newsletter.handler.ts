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

export function createNewsletterHandler(controller: NewsletterController) {
  const app = new Hono();

  app.get("/", async (c) => {
    try {
      const siteId = c.get("siteId");
      const result = await controller.list(siteId);
      return c.json({ data: result });
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
      const newsletter = await controller.create(siteId, input);
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
        const newsletter = await controller.update(siteId, id, input);
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
        const { email } = c.req.valid("json");
        await controller.sendTestEmail(siteId, id, email);
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
