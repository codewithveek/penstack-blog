/**
 * apps/api/src/providers/search/tidb.adapter.ts
 *
 * TiDB full-text search provider — uses the existing database connection.
 * No additional SDK required.
 */

import { sql } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { posts } from "@cms/core/db/schema";
import type {
  ISearchProvider,
  SearchResult,
  SearchIndexDocument,
} from "@cms/core/types/providers";
import { RepositoryError } from "@cms/core/errors";

export class TiDBSearchAdapter implements ISearchProvider {
  readonly name = "tidb";
  constructor(private readonly db: DB) {}

  async index(documents: SearchIndexDocument[]): Promise<void> {
    // TiDB FTS uses a fulltext index on the existing table; no separate indexing needed.
    // This is a no-op but satisfies the interface contract.
    return Promise.resolve();
  }

  async delete(id: string, siteId: string): Promise<void> {
    // Deletion from the posts table is handled by the repository.
    // Fulltext index is updated automatically by TiDB.
    return Promise.resolve();
  }

  async search(
    siteId: string,
    query: string,
    options?: { limit?: number; page?: number }
  ): Promise<SearchResult[]> {
    const limit = Math.min(options?.limit ?? 15, 100);
    const page = options?.page ?? 1;
    const offset = (page - 1) * limit;

    try {
      type Row = {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        score: number;
      };

      const rows = await this.db.execute<Row>(
        sql`
          SELECT
            id,
            title,
            slug,
            excerpt,
            MATCH(title, html) AGAINST (${query} IN NATURAL LANGUAGE MODE) AS score
          FROM posts
          WHERE
            site_id = ${siteId}
            AND status = 'published'
            AND deleted_at IS NULL
            AND MATCH(title, html) AGAINST (${query} IN NATURAL LANGUAGE MODE)
          ORDER BY score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      );

      return (rows as Row[]).map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt ?? "",
        score: r.score,
      }));
    } catch (err) {
      throw new RepositoryError("Failed to run fulltext search", "search", err);
    }
  }
}
