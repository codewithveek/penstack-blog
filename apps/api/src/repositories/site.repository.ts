/**
 * apps/api/src/repositories/site.repository.ts
 *
 * The ONLY file that queries the `sites` table.
 * Implements ISiteRepository.
 */

import { eq, and, sql } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { sites } from "@cms/core/db/schema";
import type { Site, NewSite } from "@cms/core/db/schema";
import type {
  ISiteRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class SiteRepository implements ISiteRepository {
  constructor(private readonly db: DB) {}

  async findById(id: string): Promise<Site | null> {
    try {
      const rows = await this.db
        .select()
        .from(sites)
        .where(eq(sites.id, id))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find site by id", "findById", err);
    }
  }

  async findBySlug(slug: string): Promise<Site | null> {
    try {
      const rows = await this.db
        .select()
        .from(sites)
        .where(eq(sites.slug, slug))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find site by slug",
        "findBySlug",
        err
      );
    }
  }

  async findByCustomDomain(domain: string): Promise<Site | null> {
    try {
      const rows = await this.db
        .select()
        .from(sites)
        .where(eq(sites.custom_domain, domain))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find site by domain",
        "findByCustomDomain",
        err
      );
    }
  }

  async findAll(pagination: PaginationParams): Promise<PaginatedResult<Site>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db.select().from(sites).limit(limit).offset(offset),
        this.db.select({ count: sql<number>`count(*)` }).from(sites),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list sites", "findAll", err);
    }
  }

  async create(data: NewSite): Promise<Site> {
    try {
      await this.db.insert(sites).values(data);
      const created = await this.findById(data.id);
      if (!created)
        throw new RepositoryError("Site not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create site", "create", err);
    }
  }

  async update(id: string, data: Partial<NewSite>): Promise<Site> {
    try {
      await this.db.update(sites).set(data).where(eq(sites.id, id));
      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError("Site", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update site", "update", err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(sites).where(eq(sites.id, id));
    } catch (err) {
      throw new RepositoryError("Failed to delete site", "delete", err);
    }
  }

  async markSetupComplete(id: string): Promise<void> {
    try {
      await this.db
        .update(sites)
        .set({ setup_completed: true })
        .where(eq(sites.id, id));
    } catch (err) {
      throw new RepositoryError(
        "Failed to mark setup complete",
        "markSetupComplete",
        err
      );
    }
  }
}
