/**
 * apps/api/src/middleware/auth.middleware.ts
 *
 * Admin auth middleware — verifies Better Auth session or hashed API key.
 * Member auth middleware — verifies member session cookie (HTTP-only).
 *
 * Per AGENTS.md §8:
 *  - Admin and member namespaces are completely separate.
 *  - siteId is injected by site-resolver.middleware, NOT here.
 *  - Never log tokens or session identifiers.
 */

import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import crypto from "node:crypto";
import { auth } from "../lib/auth";
import type { IApiKeyRepository } from "@cms/core/types/repositories";
import type { IMemberRepository } from "@cms/core/types/repositories";
import { logger } from "../lib/logger";

// ─── Admin auth ────────────────────────────────────────────────────────────────

export function createRequireAdminAuth(
  apiKeyRepo: IApiKeyRepository
): MiddlewareHandler {
  return async (c, next) => {
    // 1. Try Better Auth session (handles JWT cookie + Bearer automatically)
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (session?.user && session?.session) {
        const u = session.user as { id: string; role?: string };
        c.set("userId", u.id);
        c.set("role", (u.role as typeof c.var.role) ?? "contributor");
        await next();
        return;
      }
    } catch (err) {
      logger.debug("Better Auth session check failed", { path: c.req.path });
    }

    // 2. Try API key: Authorization: Bearer <rawKey>
    const authHeader = c.req.header("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      const rawKey = authHeader.slice(7).trim();
      if (rawKey.length > 0) {
        try {
          // API keys are stored as SHA-256(rawKey) — 256-bit random keys have
          // sufficient entropy without a salt. constant-time comparison prevents
          // timing attacks per AGENTS.md §11.
          const keyHash = crypto
            .createHash("sha256")
            .update(rawKey)
            .digest("hex");
          const apiKey = await apiKeyRepo.findByHash(keyHash);

          if (apiKey && !apiKey.revoked_at) {
            // Constant-time comparison as required by AGENTS.md §11
            const expected = Buffer.from(keyHash, "hex");
            const actual = Buffer.from(apiKey.key_hash, "hex");
            if (
              expected.length === actual.length &&
              crypto.timingSafeEqual(expected, actual)
            ) {
              c.set("userId", `api-key:${apiKey.id}`);
              c.set("role", apiKey.role as typeof c.var.role);
              // Fire-and-forget last-used update (non-blocking)
              apiKeyRepo.updateLastUsed(apiKey.id).catch(() => {});
              await next();
              return;
            }
          }
        } catch (err) {
          logger.debug("API key validation error", { path: c.req.path });
        }
      }
    }

    return c.json(
      {
        error: { code: "UNAUTHENTICATED", message: "Authentication required" },
      },
      401
    );
  };
}

// ─── Role guard ────────────────────────────────────────────────────────────────

export function requireRole(
  ...allowed: Array<"owner" | "admin" | "editor" | "author" | "contributor">
): MiddlewareHandler {
  return async (c, next) => {
    const role = c.get("role");
    if (!role || !allowed.includes(role)) {
      return c.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
          },
        },
        403
      );
    }
    await next();
  };
}

// ─── Member auth ───────────────────────────────────────────────────────────────

export function createRequireMemberAuth(
  memberRepo: IMemberRepository
): MiddlewareHandler {
  return async (c, next) => {
    const token = getCookie(c, "cms_member_session");
    if (!token) {
      return c.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Member authentication required",
          },
        },
        401
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const session = await memberRepo
      .findMemberSession(tokenHash)
      .catch(() => null);

    if (!session || session.expires_at < new Date()) {
      return c.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Member session expired or invalid",
          },
        },
        401
      );
    }

    c.set("memberSessionToken", token);
    await next();
  };
}

export function createOptionalMemberAuth(
  memberRepo: IMemberRepository
): MiddlewareHandler {
  return async (c, next) => {
    const token = getCookie(c, "cms_member_session");
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      const session = await memberRepo
        .findMemberSession(tokenHash)
        .catch(() => null);

      if (session && session.expires_at >= new Date()) {
        c.set("memberSessionToken", token);
      }
    }
    await next();
  };
}
