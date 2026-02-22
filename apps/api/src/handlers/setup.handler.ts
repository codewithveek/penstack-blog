/**
 * apps/api/src/handlers/setup.handler.ts
 *
 * First-boot setup wizard.
 * These routes are intentionally unauthenticated — they only work when
 * setup_completed = false. The site-resolver middleware enforces this guard.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  setupStep1AdminSchema,
  setupStep2SiteSchema,
  setupStep3EmailSchema,
} from "@cms/core/validators/setup";
import { logger } from "../lib/logger";
import type { SetupController } from "../controllers/setup.controller";

/**
 * Combined setup payload — all three wizard steps submitted together.
 * Step 3 (email) is optional; omitting it defaults to no email provider.
 */
const runSetupSchema = z.object({
  admin: setupStep1AdminSchema,
  site: setupStep2SiteSchema,
  email: setupStep3EmailSchema.optional(),
});

export function createSetupHandler(controller: SetupController) {
  const app = new Hono();

  /**
   * GET /setup/status
   * Returns whether initial setup is still required.
   * Used by the frontend to redirect to the setup wizard or the login page.
   */
  app.get("/status", async (c) => {
    try {
      const result = await controller.isSetupRequired();
      return c.json({ data: result });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("SETUP status check failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  /**
   * POST /setup/run
   * Execute the first-boot setup wizard.
   * Creates the first admin user, the site, and configures email if provided.
   * Returns the generated siteId and userId.
   * Once completed, further calls will return 409 Conflict.
   */
  app.post("/run", zValidator("json", runSetupSchema), async (c) => {
    try {
      const { admin, site, email } = c.req.valid("json");

      const result = await controller.runSetup({
        admin: { name: admin.name, email: admin.email },
        site: {
          name: site.site_name,
          ...(site.site_description !== undefined && {
            description: site.site_description,
          }),
          subdomain: site.site_slug,
        },
        ...(email && email.service_type !== "none"
          ? {
              email: {
                provider: email.service_type,
                fromName: (email as { from_name: string }).from_name,
                fromEmail: (email as { from_email: string }).from_email,
              },
            }
          : {}),
      });

      return c.json({ data: result }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("SETUP run failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
