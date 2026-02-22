/**
 * apps/api/src/services/settings.service.ts
 */

import crypto from "node:crypto";
import type {
  ISettingsRepository,
  IApiKeyRepository,
} from "@cms/core/types/repositories";
import type { ApiKey } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError } from "@cms/core/errors";
import type { Cache } from "../lib/cache";
import { TTL } from "../lib/cache";

export class SettingsService {
  constructor(
    private readonly settingsRepo: ISettingsRepository,
    private readonly apiKeyRepo: IApiKeyRepository,
    private readonly cache: Cache
  ) {}

  async getSiteSettings(siteId: string): Promise<Record<string, string>> {
    const cacheKey = `settings:site:${siteId}`;
    const cached = await this.cache.get<Record<string, string>>(cacheKey);
    if (cached) return cached;

    const settings = await this.settingsRepo.getAllSiteSettings(siteId);
    await this.cache.set(cacheKey, settings, TTL.FIVE_MINUTES);
    return settings;
  }

  async updateSiteSettings(
    siteId: string,
    data: Record<string, string>
  ): Promise<Record<string, string>> {
    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        this.settingsRepo.setSiteSetting(siteId, key, value)
      )
    );

    // Invalidate cache
    await this.cache.delete(`settings:site:${siteId}`);

    return this.settingsRepo.getAllSiteSettings(siteId);
  }

  async getSecitonSetting(siteId: string, key: string): Promise<string | null> {
    return this.settingsRepo.getSiteSetting(siteId, key);
  }

  // ─── API Keys ─────────────────────────────────────────────────────────────────

  async createApiKey(
    siteId: string,
    name: string,
    role: ApiKey["role"]
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    // 256-bit random key — sufficient entropy.
    // key_hash = SHA256(rawKey) — stored for constant-time lookup.
    // The raw key is returned ONCE and never stored.
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 8);
    const keySalt = crypto.randomBytes(16).toString("hex");

    const apiKey = await this.apiKeyRepo.create({
      site_id: siteId,
      name,
      role,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      key_salt: keySalt,
      last_used_at: null,
      revoked_at: null,
    });

    // Raw key is shown ONCE — never stored
    return { apiKey, rawKey };
  }

  async listApiKeys(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ApiKey>> {
    return this.apiKeyRepo.findMany(siteId, pagination);
  }

  async revokeApiKey(siteId: string, id: string): Promise<void> {
    const key = await this.apiKeyRepo.findById(siteId, id);
    if (!key) throw new NotFoundError("ApiKey", id);
    await this.apiKeyRepo.revoke(siteId, id);
  }

  async validateApiKey(rawKey: string): Promise<ApiKey | null> {
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const apiKey = await this.apiKeyRepo.findByHash(keyHash);
    if (!apiKey) return null;

    // Record last used time (fire-and-forget)
    this.apiKeyRepo.updateLastUsed(apiKey.id).catch(() => {});
    return apiKey;
  }
}