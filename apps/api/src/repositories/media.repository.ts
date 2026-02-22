/**
 * apps/api/src/repositories/media.repository.ts
 *
 * Media assets storage records.
 * Implements IMediaRepository.
 */

import { eq, and, sql, desc } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { mediaAssets } from "@cms/core/db/schema";
import type { MediaAsset, NewMediaAsset } from "@cms/core/db/schema";
import type {
  IMediaRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class MediaRepository implements IMediaRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<MediaAsset | null> {
    try {
      const rows = await this.db
        .select()
        .from(mediaAssets)
        .where(and(eq(mediaAssets.site_id, siteId), eq(mediaAssets.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find media by id", "findById", err);
    }
  }

  async findMany(
    siteId: string,
    pagination: PaginationParams & { type?: MediaAsset["type"] }
  ): Promise<PaginatedResult<MediaAsset>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [eq(mediaAssets.site_id, siteId)];
    if (pagination.type) conditions.push(eq(mediaAssets.type, pagination.type));

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(mediaAssets)
          .where(and(...conditions))
          .orderBy(desc(mediaAssets.created_at))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(mediaAssets)
          .where(and(...conditions)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list media", "findMany", err);
    }
  }

  async create(data: NewMediaAsset): Promise<MediaAsset> {
    try {
      await this.db.insert(mediaAssets).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError(
          "MediaAsset not found after insert",
          "create"
        );
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create media asset", "create", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(mediaAssets)
        .where(and(eq(mediaAssets.site_id, siteId), eq(mediaAssets.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete media asset", "delete", err);
    }
  }

  async getTotalStorageBytes(siteId: string): Promise<number> {
    try {
      const [row] = await this.db
        .select({
          total: sql<number>`COALESCE(SUM(${mediaAssets.byte_size}), 0)`,
        })
        .from(mediaAssets)
        .where(eq(mediaAssets.site_id, siteId));
      return row?.total ?? 0;
    } catch (err) {
      throw new RepositoryError(
        "Failed to get storage usage",
        "getTotalStorageBytes",
        err
      );
    }
  }
}
