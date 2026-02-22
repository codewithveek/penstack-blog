/**
 * apps/api/src/lib/cache.ts
 *
 * Redis-backed cache helper.
 * Wraps ioredis with typed get/set/invalidate methods.
 * Keeps TTLs aligned with PRD §23.1.
 */

import type IORedis from "ioredis";
import { logger } from "./logger";

export const TTL = {
  SITE_RESOLUTION: 5 * 60, // 5 min
  POST_HTML: 10 * 60, // 10 min
  PUBLIC_API: 60, // 60 s
  REDIRECT_TABLE: 10 * 60, // 10 min
  SESSION: 15 * 60, // 15 min (access token lifetime)
} as const;

export class Cache {
  constructor(private readonly redis: IORedis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.warn("Cache set failed", { key, err: String(err) });
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      logger.warn("Cache invalidate failed", { key, err: String(err) });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err) {
      logger.warn("Cache invalidate pattern failed", {
        pattern,
        err: String(err),
      });
    }
  }

  // ─── Key helpers ─────────────────────────────────────────────────────────────

  static siteByHost(hostname: string): string {
    return `site:host:${hostname}`;
  }

  static postHtml(siteId: string, postId: string): string {
    return `post:html:${siteId}:${postId}`;
  }

  static redirectTable(siteId: string): string {
    return `redirects:${siteId}`;
  }
}
