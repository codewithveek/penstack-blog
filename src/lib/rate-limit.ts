/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Suitable for single-instance deployments (Vercel serverless, single Node
 * process). For multi-instance production use, replace the store with a shared
 * backend such as Redis/Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-level store shared across requests in the same process
const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  resetAt: number;
}

/**
 * Check whether a given key (usually `"endpoint:ip"`) has exceeded its quota.
 *
 * @example
 * const result = rateLimit("signup:" + ip, { limit: 5, windowSecs: 60 });
 * if (!result.success) return Response.json({ error: "Too many requests" }, { status: 429 });
 */
export function rateLimit(
  key: string,
  { limit, windowSecs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSecs * 1000;

  // Look up the existing entry for this key (no global sweep; entries for
  // other keys are only reclaimed when they are next accessed)
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract the best-effort client IP from a Next.js Request.
 * Falls back to `"unknown"` when the IP cannot be determined.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
