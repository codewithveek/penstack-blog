/**
 * apps/api/src/repositories/auth-settings.repository.ts
 *
 * Per-site OAuth configuration.
 * OAuth client_secret is encrypted at rest (AES-256-GCM) per AGENTS.md 8.
 * Implements IAuthSettingsRepository.
 */

import { eq } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { siteAuthSettings } from "@cms/core/db/schema";
import type { SiteAuthSettings } from "@cms/core/db/schema";
import type { IAuthSettingsRepository } from "@cms/core/types/repositories";
import { RepositoryError } from "@cms/core/errors";
import { encrypt, decrypt, isEncrypted } from "@cms/core/utils/encryption";

type UpdateData = Partial<Omit<SiteAuthSettings, "site_id" | "updated_at">>;

export class AuthSettingsRepository implements IAuthSettingsRepository {
  constructor(private readonly db: DB) {}

  //  Encryption helpers 

  private encryptRow(data: UpdateData): UpdateData {
    const result: UpdateData = { ...data };
    if (result.google_client_secret && !isEncrypted(result.google_client_secret)) {
      result.google_client_secret = encrypt(result.google_client_secret);
    }
    if (result.facebook_app_secret && !isEncrypted(result.facebook_app_secret)) {
      result.facebook_app_secret = encrypt(result.facebook_app_secret);
    }
    return result;
  }

  private decryptRow(row: SiteAuthSettings): SiteAuthSettings {
    return {
      ...row,
      google_client_secret:
        row.google_client_secret && isEncrypted(row.google_client_secret)
          ? decrypt(row.google_client_secret)
          : row.google_client_secret,
      facebook_app_secret:
        row.facebook_app_secret && isEncrypted(row.facebook_app_secret)
          ? decrypt(row.facebook_app_secret)
          : row.facebook_app_secret,
    };
  }

  //  Queries 

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
      throw new RepositoryError("Failed to find auth settings", "findBySiteId", err);
    }
  }

  async upsert(
    siteId: string,
    data: Partial<Omit<SiteAuthSettings, "site_id" | "updated_at">>
  ): Promise<SiteAuthSettings> {
    try {
      const encrypted = this.encryptRow(data);
      const insertData = { ...encrypted, site_id: siteId };

      await this.db
        .insert(siteAuthSettings)
        .values(insertData)
        .onDuplicateKeyUpdate({
          set: { ...encrypted, updated_at: new Date() },
        });

      const result = await this.findBySiteId(siteId);
      if (!result)
        throw new RepositoryError("AuthSettings not found after upsert", "upsert");
      return result;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to upsert auth settings", "upsert", err);
    }
  }
}
