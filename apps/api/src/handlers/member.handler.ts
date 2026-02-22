/**
 * apps/api/src/handlers/member.handler.ts
 *
 * Admin routes: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id  (under admin auth)
 * Public auth routes: POST /auth/magic-link, POST /auth/verify, POST /auth/logout
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAppError } from "@cms/core/errors";
import {
  createMemberSchema,
  updateMemberSchema,
  listMembersQuerySchema,
  magicLinkRequestSchema,
  magicLinkVerifySchema,
} from "@cms/core/validators/member";
import { logger } from "../lib/logger";
import type { MemberController } from "../controllers/member.controller";

const idParamSchema = z.object({ id: z.string().uuid() });

/**
 * Admin CRUD handler — mount under /admin/v1/members (behind requireAdminAuth).
 */
export function createMemberAdminHandler(controller: MemberController) {
  const app = new Hono();

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  app.get("/", zValidator("query", listMembersQuerySchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const query = c.req.valid("query");
      const result = await controller.list(siteId, query);
      return c.json({ data: result.data, meta: result.meta });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 400 | 500);
      logger.error("MEMBER list failed", err);
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
      const member = await controller.getById(siteId, id);
      return c.json({ data: member });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 404 | 500);
      logger.error("MEMBER getById failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.post("/", zValidator("json", createMemberSchema), async (c) => {
    try {
      const siteId = c.get("siteId");
      const input = c.req.valid("json");
      const member = await controller.create(siteId, input);
      return c.json({ data: member }, 201);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.toJSON() },
          err.httpStatus as 400 | 409 | 422 | 500
        );
      logger.error("MEMBER create failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  app.patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateMemberSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { id } = c.req.valid("param");
        const input = c.req.valid("json");
        const member = await controller.update(siteId, id, input);
        return c.json({ data: member });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 404 | 422 | 500
          );
        logger.error("MEMBER update failed", err);
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
      logger.error("MEMBER delete failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  // ── Member self-service auth (public — no admin auth middleware) ────────────

  app.post(
    "/auth/magic-link",
    zValidator("json", magicLinkRequestSchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { email } = c.req.valid("json");
        await controller.requestMagicLink(siteId, email);
        // Always 200 — never confirm whether email exists (anti-enumeration)
        return c.json({
          data: {
            message: "If this email is registered, a login link has been sent.",
          },
        });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 422 | 500
          );
        logger.error("MEMBER magic-link request failed", err);
        return c.json(
          {
            error: { code: "INTERNAL_ERROR", message: "Internal server error" },
          },
          500
        );
      }
    }
  );

  app.post(
    "/auth/verify",
    zValidator("json", magicLinkVerifySchema),
    async (c) => {
      try {
        const siteId = c.get("siteId");
        const { token } = c.req.valid("json");
        const userAgent = c.req.header("user-agent") ?? undefined;
        // Extract IP from CF-Connecting-IP (Cloudflare) or X-Forwarded-For, fallback to remote address
        const ip =
          c.req.header("cf-connecting-ip") ??
          c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
          undefined;
        const session = await controller.verifyMagicLink(
          siteId,
          token,
          ip,
          userAgent
        );
        // Set HTTP-only session cookie
        c.header(
          "Set-Cookie",
          `cms_member_session=${session.sessionToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
        );
        return c.json({ data: { member: session.member } });
      } catch (err) {
        if (isAppError(err))
          return c.json(
            { error: err.toJSON() },
            err.httpStatus as 400 | 401 | 422 | 500
          );
        logger.error("MEMBER verify magic-link failed", err);
        return c.json(
          {
            error: { code: "INTERNAL_ERROR", message: "Internal server error" },
          },
          500
        );
      }
    }
  );

  app.post("/auth/logout", async (c) => {
    try {
      const siteId = c.get("siteId");
      const cookieHeader = c.req.header("cookie") ?? "";
      const match = cookieHeader.match(/cms_member_session=([^;]+)/);
      const sessionToken = match ? match[1] : undefined;
      if (sessionToken) {
        await controller.logout(siteId, sessionToken);
      }
      // Clear cookie regardless
      c.header(
        "Set-Cookie",
        "cms_member_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
      );
      return c.json({ data: { message: "Logged out" } });
    } catch (err) {
      if (isAppError(err))
        return c.json({ error: err.toJSON() }, err.httpStatus as 500);
      logger.error("MEMBER logout failed", err);
      return c.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        500
      );
    }
  });

  return app;
}
