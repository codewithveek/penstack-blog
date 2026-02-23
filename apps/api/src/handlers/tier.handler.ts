/**
 * apps/api/src/handlers/tier.handler.ts
 *
 * Admin CRUD for membership tiers.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { isAppError } from "@cms/core/errors";
import { createTierSchema } from "@cms/core/validators/tier";
import { logger } from "../lib/logger";
import type { TierController } from "../controllers/tier.controller";

export function createTierHandler(controller: TierController) {
  const app = new Hono();

  app.get("/", async (c) => {
    try {
      const siteId = c.get("siteId");
      const tiers = await controller.list(siteId);
      return c.json({ data: tiers });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("TIER list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createTierSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const tier = await controller.create(siteId, {
        name: input.name,
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.monthly_price_cents !== undefined && {
          monthly_price_cents: input.monthly_price_cents,
        }),
        ...(input.yearly_price_cents !== undefined && {
          yearly_price_cents: input.yearly_price_cents,
        }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.benefits !== undefined && { benefits: input.benefits }),
        active: input.active,
        trial_days: input.trial_days,
      });
      return c.json({ data: tier }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("TIER create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
