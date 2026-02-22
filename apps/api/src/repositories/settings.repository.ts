/**
 * apps/api/src/repositories/settings.repository.ts
 *
 * Platform-wide settings (key–value) and per-site settings (key–value).
 * Also manages the one-shot platform setup status record.
 * Implements ISettingsRepository.
 */

import { eq, and, sql } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import {
  siteSettings,
  platformSettings,
  platformSetupStatus,
} from "@cms/core/db/schema";
import type { ISettingsRepository } from "@cms/core/types/repositories";
import { RepositoryError } from "@cms/core/errors";

export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly db: DB) {}

  // ─── Platform settings ────────────────────────────────────────────────────────

  async getPlatformSetting(key: string): Promise<string | null> {
    try {
      const rows = await this.db
        .select({ value: platformSettings.value })
        .from(platformSettings)
        .where(eq(platformSettings.key, key))
        .limit(1);
      return rows[0]?.value ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to get platform setting",
        "getPlatformSetting",
        err
      );
    }
  }

  async setPlatformSetting(key: string, value: string): Promise<void> {
    try {
      await this.db
        .insert(platformSettings)
        .values({ key, value, updated_at: new Date() })
        .onDuplicateKeyUpdate({ set: { value, updated_at: new Date() } });
    } catch (err) {
      throw new RepositoryError(
        "Failed to set platform setting",
        "setPlatformSetting",
        err
      );
    }
  }

  async getAllPlatformSettings(): Promise<Record<string, string>> {
    try {
      const rows = await this.db
        .select({ key: platformSettings.key, value: platformSettings.value })
        .from(platformSettings);
      return Object.fromEntries(
        rows.filter((r) => r.value !== null).map((r) => [r.key, r.value!])
      );
    } catch (err) {
      throw new RepositoryError(
        "Failed to get all platform settings",
        "getAllPlatformSettings",
        err
      );
    }
  }

  // ─── Site settings ────────────────────────────────────────────────────────────

  async getSiteSetting(siteId: string, key: string): Promise<string | null> {
    try {
      const rows = await this.db
        .select({ value: siteSettings.value })
        .from(siteSettings)
        .where(and(eq(siteSettings.site_id, siteId), eq(siteSettings.key, key)))
        .limit(1);
      return rows[0]?.value ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to get site setting",
        "getSiteSetting",
        err
      );
    }
  }

  async setSiteSetting(
    siteId: string,
    key: string,
    value: string
  ): Promise<void> {
    try {
      await this.db
        .insert(siteSettings)
        .values({ site_id: siteId, key, value, updated_at: new Date() })
        .onDuplicateKeyUpdate({ set: { value, updated_at: new Date() } });
    } catch (err) {
      throw new RepositoryError(
        "Failed to set site setting",
        "setSiteSetting",
        err
      );
    }
  }

  async getAllSiteSettings(siteId: string): Promise<Record<string, string>> {
    try {
      const rows = await this.db
        .select({ key: siteSettings.key, value: siteSettings.value })
        .from(siteSettings)
        .where(eq(siteSettings.site_id, siteId));
      return Object.fromEntries(
        rows.filter((r) => r.value !== null).map((r) => [r.key, r.value!])
      );
    } catch (err) {
      throw new RepositoryError(
        "Failed to get all site settings",
        "getAllSiteSettings",
        err
      );
    }
  }

  async deleteSiteSetting(siteId: string, key: string): Promise<void> {
    try {
      await this.db
        .delete(siteSettings)
        .where(
          and(eq(siteSettings.site_id, siteId), eq(siteSettings.key, key))
        );
    } catch (err) {
      throw new RepositoryError(
        "Failed to delete site setting",
        "deleteSiteSetting",
        err
      );
    }
  }

  // ─── Platform setup status ────────────────────────────────────────────────────

  async getPlatformSetupStatus(): Promise<{
    is_completed: boolean;
    completed_at: Date | null;
  }> {
    try {
      const rows = await this.db
        .select({
          is_completed: platformSetupStatus.is_completed,
          completed_at: platformSetupStatus.completed_at,
        })
        .from(platformSetupStatus)
        .limit(1);
      // If no row exists, setup is not started
      return rows[0] ?? { is_completed: false, completed_at: null };
    } catch (err) {
      throw new RepositoryError(
        "Failed to get platform setup status",
        "getPlatformSetupStatus",
        err
      );
    }
  }

  async markPlatformSetupComplete(): Promise<void> {
    const now = new Date();
    try {
      const existing = await this.db
        .select({ id: platformSetupStatus.id })
        .from(platformSetupStatus)
        .limit(1);

      if (existing[0]) {
        await this.db
          .update(platformSetupStatus)
          .set({ is_completed: true, completed_at: now, updated_at: now });
      } else {
        await this.db.insert(platformSetupStatus).values({
          id: crypto.randomUUID(),
          is_completed: true,
          completed_at: now,
          created_at: now,
          updated_at: now,
        });
      }
    } catch (err) {
      throw new RepositoryError(
        "Failed to mark platform setup complete",
        "markPlatformSetupComplete",
        err
      );
    }
  }
}
