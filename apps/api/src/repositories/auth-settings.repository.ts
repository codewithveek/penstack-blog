/**
 * apps/api/src/repositories/auth-settings.repository.ts
 *
 * Per-site OAuth configuration.
 * OAuth client_secret is encrypted at rest (AES-256-GCM) per AGENTS.md §8.
 * Implements IAuthSettingsRepository.
 */

import { eq } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { siteAuthSettings } from "@cms/core/db/schema";
import type {
  SiteAuthSettings,
  NewSiteAuthSettings,
} from "@cms/core/db/schema";
import type { IAuthSettingsRepository } from "@cms/core/types/repositories";
import { RepositoryError } from "@cms/core/errors";
import { encrypt, decrypt, isEncrypted } from "@cms/core/utils/encryption";

export class AuthSettingsRepository implements IAuthSettingsRepository {
  constructor(private readonly db: DB) {}

  // ─── Encryption helpers ───────────────────────────────────────────────────────

  private encryptRow(data: NewSiteAuthSettings): NewSiteAuthSettings {
    return {
      ...data,
      google_client_secret:
        data.google_client_secret && !isEncrypted(data.google_client_secret)
          ? encrypt(data.google_client_secret)
          : data.google_client_secret,
      facebook_client_secret:
        data.facebook_client_secret && !isEncrypted(data.facebook_client_secret)
          ? encrypt(data.facebook_client_secret)
          : data.facebook_client_secret,
      github_client_secret:
        data.github_client_secret && !isEncrypted(data.github_client_secret)
          ? encrypt(data.github_client_secret)
          : data.github_client_secret,
    };
  }

  private decryptRow(row: SiteAuthSettings): SiteAuthSettings {
    return {
      ...row,
      google_client_secret:
        row.google_client_secret && isEncrypted(row.google_client_secret)
          ? decrypt(row.google_client_secret)
          : row.google_client_secret,
      facebook_client_secret:
        row.facebook_client_secret && isEncrypted(row.facebook_client_secret)
          ? decrypt(row.facebook_client_secret)
          : row.facebook_client_secret,
      github_client_secret:
        row.github_client_secret && isEncrypted(row.github_client_secret)
          ? decrypt(row.github_client_secret)
          : row.github_client_secret,
    };
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async findBySiteId(siteId: string): Promise<SiteAuthSettings | null> {
    try {
      const rows = await this.db
        .select()
        .from(siteAuthSettings)
        .where(eq(siteAuthSettings.site_id, siteId))
        .limit(1);
      if (!rows[0]) return null;
      return this.decryptRow(rows[0]);
    } catch (err) {
      throw new RepositoryError(
        "Failed to find auth settings",
        "findBySiteId",
        err
      );
    }
  }

  async upsert(data: NewSiteAuthSettings): Promise<SiteAuthSettings> {
    try {
      const encrypted = this.encryptRow(data);

      await this.db
        .insert(siteAuthSettings)
        .values(encrypted)
        .onDuplicateKeyUpdate({
          set: {
            ...encrypted,
            updated_at: new Date(),
          },
        });

      const result = await this.findBySiteId(data.site_id);
      if (!result)
        throw new RepositoryError(
          "AuthSettings not found after upsert",
          "upsert"
        );
      return result;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to upsert auth settings",
        "upsert",
        err
      );
    }
  }
}
