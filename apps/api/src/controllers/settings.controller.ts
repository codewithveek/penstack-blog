/**
 * apps/api/src/controllers/settings.controller.ts
 */

import type { SettingsService } from "../services/settings.service"
import type { SiteSettings, ApiKey } from "@cms/core/db/schema"
import type { PaginatedResult, PaginationParams } from "@cms/core/types/repositories"

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  async getSiteSettings(siteId: string): Promise<SiteSettings | null> {
    return this.settingsService.getSiteSettings(siteId)
  }

  async updateSiteSettings(siteId: string, data: Partial<SiteSettings>): Promise<SiteSettings> {
    return this.settingsService.updateSiteSettings(siteId, data)
  }

  async createApiKey(siteId: string, label: string, role: ApiKey["role"]): Promise<{ apiKey: ApiKey; rawKey: string }> {
    return this.settingsService.createApiKey(siteId, label, role)
  }

  async listApiKeys(siteId: string, pagination: PaginationParams): Promise<PaginatedResult<ApiKey>> {
    return this.settingsService.listApiKeys(siteId, pagination)
  }

  async revokeApiKey(siteId: string, id: string): Promise<void> {
    return this.settingsService.revokeApiKey(siteId, id)
  }
}
