/**
 * apps/api/src/repositories/redirect.repository.ts
 *
 * URL redirects per site.
 * Implements IRedirectRepository.
 */

import { eq, and, sql } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { redirects } from "@cms/core/db/schema";
import type { Redirect, NewRedirect } from "@cms/core/db/schema";
import type {
  IRedirectRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class RedirectRepository implements IRedirectRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<Redirect | null> {
    try {
      const rows = await this.db
        .select()
        .from(redirects)
        .where(and(eq(redirects.site_id, siteId), eq(redirects.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find redirect by id",
        "findById",
        err
      );
    }
  }

  async findByFrom(siteId: string, from: string): Promise<Redirect | null> {
    try {
      const rows = await this.db
        .select()
        .from(redirects)
        .where(and(eq(redirects.site_id, siteId), eq(redirects.from_url, from)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find redirect by from URL",
        "findByFrom",
        err
      );
    }
  }

  async findManyBySiteId(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Redirect>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(redirects)
          .where(eq(redirects.site_id, siteId))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(redirects)
          .where(eq(redirects.site_id, siteId)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError(
        "Failed to list redirects",
        "findManyBySiteId",
        err
      );
    }
  }

  async findAllBySiteId(siteId: string): Promise<Redirect[]> {
    // Used for the in-memory redirect lookup (Redis-cached)
    try {
      return this.db
        .select()
        .from(redirects)
        .where(eq(redirects.site_id, siteId));
    } catch (err) {
      throw new RepositoryError(
        "Failed to load all redirects",
        "findAllBySiteId",
        err
      );
    }
  }

  async create(data: NewRedirect): Promise<Redirect> {
    try {
      await this.db.insert(redirects).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError("Redirect not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create redirect", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewRedirect>
  ): Promise<Redirect> {
    try {
      await this.db
        .update(redirects)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(redirects.site_id, siteId), eq(redirects.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Redirect", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update redirect", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(redirects)
        .where(and(eq(redirects.site_id, siteId), eq(redirects.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete redirect", "delete", err);
    }
  }
}
