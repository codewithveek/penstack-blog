/**
 * apps/api/src/handlers/auth-settings.handler.ts
 *
 * Admin handler for reading/updating per-site OAuth configuration.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { isAppError } from "@cms/core/errors";
import { updateAuthSettingsSchema } from "@cms/core/validators/auth-settings";
import { logger } from "../lib/logger";
import type { AuthSettingsController } from "../controllers/auth-settings.controller";

export function createAuthSettingsHandler(controller: AuthSettingsController) {
  const app = new Hono();

  app.get("/", async (c) => {
    try {
      const siteId = c.get("siteId");
      const settings = await controller.get(siteId);
      return c.json({ data: settings });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("AUTH_SETTINGS get failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch("/", zValidator("json", updateAuthSettingsSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      // Build update data, excluding undefined values for exactOptionalPropertyTypes
      const data: Record<string, boolean | string | null> = {};
      if (input.google_enabled !== undefined) data["google_enabled"] = input.google_enabled;
      if (input.google_client_id !== undefined) data["google_client_id"] = input.google_client_id;
      if (input.google_client_secret !== undefined) data["google_client_secret"] = input.google_client_secret;
      if (input.facebook_enabled !== undefined) data["facebook_enabled"] = input.facebook_enabled;
      if (input.facebook_app_id !== undefined) data["facebook_app_id"] = input.facebook_app_id;
      if (input.facebook_app_secret !== undefined) data["facebook_app_secret"] = input.facebook_app_secret;
      if (input.allow_social_for_admins !== undefined) data["allow_social_for_admins"] = input.allow_social_for_admins;
      if (input.allow_social_for_members !== undefined) data["allow_social_for_members"] = input.allow_social_for_members;
      const settings = await controller.update(siteId, data);
      return c.json({ data: settings });
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 422 | 500
        );
      logger.error("AUTH_SETTINGS update failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
