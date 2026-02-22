/**
 * apps/api/src/handlers/media.handler.ts
 *
 * MediaController is obtained via the async getMediaController() helper in container.ts
 * so this factory is also async.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import { logger } from "../lib/logger";
import type { MediaController } from "../controllers/media.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  type: z.enum(["image", "video", "audio", "document"]).optional(),
});

const updateMediaSchema = z.object({
  alt_text: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
  title: z.string().max(255).optional(),
});

// Accepted MIME types — server enforces via magic-byte validation inside MediaService,
// but we also gate here to return a clear 400 before any processing.
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export function createMediaHandler(controller: MediaController) {
  const app = new Hono();

  app.get("/", zValidator("query", listMediaQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const query = c.req.valid("query");
      const result = await controller.list(siteId, query);
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("MEDIA list failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.get("/storage-usage", async (c) => {
    try {
      const siteId = c.get("siteId");
      const usage = await controller.getStorageUsage(siteId);
      return c.json({ data: usage });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("MEDIA storage-usage failed", err);
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
      const asset = await controller.getById(siteId, id);
      return c.json({ data: asset });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("MEDIA getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/upload", async (c) => {
    try {
      const siteId = c.get("siteId");
      const userId = c.get("userId");

      let formData: FormData;
      try {
        formData = await c.req.raw.formData();
      } catch {
        return c.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Expected multipart/form-data",
            },
          },
          400
        );
      }

      const file = formData.get("file");
      if (!(file instanceof File)) {
        return c.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "A file field is required",
            },
          },
          400
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return c.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: `File exceeds the maximum allowed size of 100 MB`,
            },
          },
          400
        );
      }

      // Coarse content-type gate — magic-byte verification happens in MediaService
      if (file.type && !ACCEPTED_MIME_TYPES.has(file.type)) {
        return c.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: `File type '${file.type}' is not accepted`,
            },
          },
          400
        );
      }

      const altText =
        typeof formData.get("alt_text") === "string"
          ? (formData.get("alt_text") as string)
          : undefined;
      const caption =
        typeof formData.get("caption") === "string"
          ? (formData.get("caption") as string)
          : undefined;
      const title =
        typeof formData.get("title") === "string"
          ? (formData.get("title") as string)
          : (file.name ?? undefined);

      const buffer = Buffer.from(await file.arrayBuffer());
      const asset = await controller.upload(siteId, userId, buffer, file.name, {
        altText,
        caption,
        title,
      });
      return c.json({ data: asset }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 422 | 500
        );
      logger.error("MEDIA upload failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateMediaSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const asset = await controller.update(siteId, id, input);
        return c.json({ data: asset });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 500
          );
        logger.error("MEDIA update failed", err);
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
      logger.error("MEDIA delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
