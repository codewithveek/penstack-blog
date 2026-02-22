/**
 * apps/api/src/services/settings.service.ts
 */

import crypto from "node:crypto";
import type {
  ISettingsRepository,
  IApiKeyRepository,
} from "@cms/core/types/repositories";
import type { SiteSettings, ApiKey } from "@cms/core/db/schema";
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

  async getSiteSettings(siteId: string): Promise<SiteSettings | null> {
    return this.settingsRepo.findBySiteId(siteId);
  }

  async updateSiteSettings(
    siteId: string,
    data: Partial<SiteSettings>
  ): Promise<SiteSettings> {
    const existing = await this.settingsRepo.findBySiteId(siteId);

    const result = await this.settingsRepo.upsertSiteSettings({
      id: existing?.id ?? crypto.randomUUID(),
      site_id: siteId,
      ...(existing ?? {}),
      ...data,
      updated_at: new Date(),
    } as Parameters<typeof this.settingsRepo.upsertSiteSettings>[0]);

    return result;
  }

  // ─── API Keys ─────────────────────────────────────────────────────────────────

  async createApiKey(
    siteId: string,
    label: string,
    role: ApiKey["role"]
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const salt = crypto.randomBytes(16).toString("hex");
    const keyHash = crypto
      .createHash("sha256")
      .update(rawKey + salt)
      .digest("hex");

    const apiKey = await this.apiKeyRepo.create({
      id: crypto.randomUUID(),
      site_id: siteId,
      label,
      role,
      key_hash: keyHash,
      key_salt: salt,
      active: true,
      last_used_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Raw key is shown ONCE — never stored
    return { apiKey, rawKey };
  }

  async listApiKeys(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ApiKey>> {
    return this.apiKeyRepo.findManyBySiteId(siteId, pagination);
  }

  async revokeApiKey(siteId: string, id: string): Promise<void> {
    const key = await this.apiKeyRepo.findById(siteId, id);
    if (!key) throw new NotFoundError("ApiKey", id);
    await this.apiKeyRepo.revoke(siteId, id);
  }

  async validateApiKey(rawKey: string, salt: string): Promise<ApiKey | null> {
    const keyHash = crypto
      .createHash("sha256")
      .update(rawKey + salt)
      .digest("hex");
    const apiKey = await this.apiKeyRepo.findByKeyHash(keyHash);
    if (!apiKey) return null;

    // Record last used time (fire-and-forget)
    this.apiKeyRepo.recordLastUsed(apiKey.id).catch(() => {});
    return apiKey;
  }
}
