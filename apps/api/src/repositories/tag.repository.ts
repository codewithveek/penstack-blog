/**
 * apps/api/src/repositories/tag.repository.ts
 *
 * All tags queries.
 * Implements ITagRepository.
 */

import { eq, and, sql, like } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { tags } from "@cms/core/db/schema";
import type { Tag, NewTag } from "@cms/core/db/schema";
import type {
  ITagRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class TagRepository implements ITagRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<Tag | null> {
    try {
      const rows = await this.db
        .select()
        .from(tags)
        .where(and(eq(tags.site_id, siteId), eq(tags.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find tag by id", "findById", err);
    }
  }

  async findBySlug(siteId: string, slug: string): Promise<Tag | null> {
    try {
      const rows = await this.db
        .select()
        .from(tags)
        .where(and(eq(tags.site_id, siteId), eq(tags.slug, slug)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find tag by slug",
        "findBySlug",
        err
      );
    }
  }

  async findMany(
    siteId: string,
    pagination: PaginationParams & { search?: string }
  ): Promise<PaginatedResult<Tag>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [eq(tags.site_id, siteId)];
    if (pagination.search)
      conditions.push(like(tags.name, `%${pagination.search}%`));

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(tags)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(tags)
          .where(and(...conditions)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list tags", "findMany", err);
    }
  }

  async create(data: NewTag): Promise<Tag> {
    try {
      await this.db.insert(tags).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError("Tag not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create tag", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewTag>
  ): Promise<Tag> {
    try {
      await this.db
        .update(tags)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(tags.site_id, siteId), eq(tags.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Tag", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update tag", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(tags)
        .where(and(eq(tags.site_id, siteId), eq(tags.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete tag", "delete", err);
    }
  }
}
