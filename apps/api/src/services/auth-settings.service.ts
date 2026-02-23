/**
 * apps/api/src/services/auth-settings.service.ts
 *
 * Per-site authentication settings — enables/disables OAuth providers,
 * stores encrypted credentials.
 */

import type { IAuthSettingsRepository } from "@cms/core/types/repositories";
import type { SiteAuthSettings } from "@cms/core/db/schema";

export class AuthSettingsService {
  constructor(private readonly authSettingsRepo: IAuthSettingsRepository) {}

  async get(siteId: string): Promise<SiteAuthSettings | null> {
    return this.authSettingsRepo.findBySiteId(siteId);
  }

  async update(
    siteId: string,
    data: Partial<Omit<SiteAuthSettings, "site_id" | "updated_at">>
  ): Promise<SiteAuthSettings> {
    return this.authSettingsRepo.upsert(siteId, data);
  }
}
