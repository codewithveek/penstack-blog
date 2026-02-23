/**
 * apps/api/src/controllers/auth-settings.controller.ts
 */

import type { AuthSettingsService } from "../services/auth-settings.service";
import type { SiteAuthSettings } from "@cms/core/db/schema";

export class AuthSettingsController {
  constructor(private readonly authSettingsService: AuthSettingsService) {}

  async get(siteId: string): Promise<SiteAuthSettings | null> {
    return this.authSettingsService.get(siteId);
  }

  async update(
    siteId: string,
    data: Partial<Omit<SiteAuthSettings, "site_id" | "updated_at">>
  ): Promise<SiteAuthSettings> {
    return this.authSettingsService.update(siteId, data);
  }
}
