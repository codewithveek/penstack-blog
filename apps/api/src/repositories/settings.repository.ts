/**
 * apps/api/src/repositories/settings.repository.ts
 *
 * Platform settings and site-level settings.
 * Implements ISettingsRepository.
 */

import { eq, and } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { siteSettings, platformSettings } from "@cms/core/db/schema";
import type {
  SiteSettings,
  NewSiteSettings,
  PlatformSettings,
  NewPlatformSettings,
} from "@cms/core/db/schema";
import type { ISettingsRepository } from "@cms/core/types/repositories";
import { RepositoryError } from "@cms/core/errors";

export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly db: DB) {}

  // ─── Site settings ────────────────────────────────────────────────────────────

  async findBySiteId(siteId: string): Promise<SiteSettings | null> {
    try {
      const rows = await this.db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.site_id, siteId))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find site settings",
        "findBySiteId",
        err
      );
    }
  }

  async upsertSiteSettings(data: NewSiteSettings): Promise<SiteSettings> {
    try {
      await this.db
        .insert(siteSettings)
        .values(data)
        .onDuplicateKeyUpdate({
          set: {
            ...data,
            updated_at: new Date(),
          },
        });

      const result = await this.findBySiteId(data.site_id);
      if (!result)
        throw new RepositoryError(
          "SiteSettings not found after upsert",
          "upsertSiteSettings"
        );
      return result;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to upsert site settings",
        "upsertSiteSettings",
        err
      );
    }
  }

  // ─── Platform settings ────────────────────────────────────────────────────────

  async getPlatformSettings(): Promise<PlatformSettings | null> {
    try {
      const rows = await this.db.select().from(platformSettings).limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to get platform settings",
        "getPlatformSettings",
        err
      );
    }
  }

  async upsertPlatformSettings(
    data: NewPlatformSettings
  ): Promise<PlatformSettings> {
    try {
      await this.db
        .insert(platformSettings)
        .values(data)
        .onDuplicateKeyUpdate({
          set: {
            ...data,
            updated_at: new Date(),
          },
        });

      const result = await this.getPlatformSettings();
      if (!result)
        throw new RepositoryError(
          "PlatformSettings not found after upsert",
          "upsertPlatformSettings"
        );
      return result;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to upsert platform settings",
        "upsertPlatformSettings",
        err
      );
    }
  }
}
