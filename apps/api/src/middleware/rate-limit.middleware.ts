/**
 * apps/api/src/middleware/rate-limit.middleware.ts
 *
 * Redis-based sliding window rate limiter.
 *
 * Limits:
 *  - Auth endpoints  : 10 req / min per IP
 *  - Public API      : 60 req / min per API key or IP
 *  - Admin API       : 500 req / min per user or API key
 *
 * Returns HTTP 429 with Retry-After header on violation.
 * Per AGENTS.md §11: rate limiting on all public endpoints.
 */

import type { MiddlewareHandler } from "hono";
import type { Redis } from "ioredis";
import { RateLimitError } from "@cms/core/errors";

interface RateLimitOptions {
  /** Maximum requests per window */
  limit: number;
  /** Window length in seconds */
  windowSeconds: number;
  /** Key prefix to namespace different limits */
  prefix: string;
}

function buildKey(prefix: string, identifier: string): string {
  return `ratelimit:${prefix}:${identifier}`;
}

function getIdentifier(c: Parameters<MiddlewareHandler>[0]): string {
  // Prefer authenticated identity; fall back to IP
  const userId = c.get("userId");
  if (userId) return userId;
  const forwarded = c.req.header("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]!.trim() : "unknown";
  return ip;
}

export function createRateLimiter(
  redis: Redis,
  options: RateLimitOptions
): MiddlewareHandler {
  const { limit, windowSeconds, prefix } = options;

  return async (c, next) => {
    const id = getIdentifier(c);
    const key = buildKey(prefix, id);
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Sliding window using sorted set: score = timestamp (ms)
    const pipe = redis.pipeline();
    pipe.zremrangebyscore(key, "-inf", windowStart);
    pipe.zadd(key, now, `${now}-${Math.random()}`);
    pipe.zcard(key);
    pipe.pexpire(key, windowSeconds * 1000);

    const results = await pipe.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    if (count > limit) {
      const retryAfter = windowSeconds;
      c.header("Retry-After", String(retryAfter));
      c.header("X-RateLimit-Limit", String(limit));
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", String(Math.ceil(now / 1000) + retryAfter));
      throw new RateLimitError(
        "Too many requests. Please try again later.",
        retryAfter
      );
    }

    const remaining = Math.max(limit - count, 0);
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header(
      "X-RateLimit-Reset",
      String(Math.ceil(now / 1000) + windowSeconds)
    );

    await next();
  };
}

// ─── Pre-built limiter factories ────────────────────────────────────────────

export function authRateLimiter(redis: Redis | null): MiddlewareHandler {
  if (!redis) return async (_c, next) => next();
  return createRateLimiter(redis, {
    prefix: "auth",
    limit: 10,
    windowSeconds: 60,
  });
}

export function publicApiRateLimiter(redis: Redis | null): MiddlewareHandler {
  if (!redis) return async (_c, next) => next();
  return createRateLimiter(redis, {
    prefix: "public",
    limit: 60,
    windowSeconds: 60,
  });
}

export function adminApiRateLimiter(redis: Redis | null): MiddlewareHandler {
  if (!redis) return async (_c, next) => next();
  return createRateLimiter(redis, {
    prefix: "admin",
    limit: 500,
    windowSeconds: 60,
  });
}
