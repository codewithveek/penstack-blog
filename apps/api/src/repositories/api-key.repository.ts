/**
 * apps/api/src/repositories/api-key.repository.ts
 *
 * API keys (admin + content public keys).
 * Keys are stored as SHA-256 hash+salt — never the raw key.
 * Implements IApiKeyRepository.
 */

import crypto from "node:crypto";
import { eq, and, sql, desc, isNull } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { apiKeys } from "@cms/core/db/schema";
import type { ApiKey } from "@cms/core/db/schema";
import type {
  IApiKeyRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { RepositoryError } from "@cms/core/errors";

export class ApiKeyRepository implements IApiKeyRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<ApiKey | null> {
    try {
      const rows = await this.db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.site_id, siteId), eq(apiKeys.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find API key by id",
        "findById",
        err
      );
    }
  }

  async findByHash(keyHash: string): Promise<ApiKey | null> {
    try {
      const rows = await this.db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.key_hash, keyHash), isNull(apiKeys.revoked_at)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find API key by hash",
        "findByHash",
        err
      );
    }
  }

  async findMany(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ApiKey>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(apiKeys)
          .where(eq(apiKeys.site_id, siteId))
          .orderBy(desc(apiKeys.created_at))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(apiKeys)
          .where(eq(apiKeys.site_id, siteId)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError(
        "Failed to list API keys",
        "findMany",
        err
      );
    }
  }

  async create(data: Omit<ApiKey, "id" | "created_at">): Promise<ApiKey> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(apiKeys).values({ ...data, id } as typeof apiKeys.$inferInsert);
      const created = await this.findById(data.site_id, id);
      if (!created)
        throw new RepositoryError("ApiKey not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create API key", "create", err);
    }
  }

  async revoke(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .update(apiKeys)
        .set({ revoked_at: new Date() })
        .where(and(eq(apiKeys.site_id, siteId), eq(apiKeys.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to revoke API key", "revoke", err);
    }
  }

  async updateLastUsed(id: string): Promise<void> {
    try {
      await this.db
        .update(apiKeys)
        .set({ last_used_at: new Date() })
        .where(eq(apiKeys.id, id));
    } catch (err) {
      throw new RepositoryError(
        "Failed to update API key last used",
        "updateLastUsed",
        err
      );
    }
  }
}
