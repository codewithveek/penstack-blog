/**
 * apps/api/src/providers/search/meilisearch.adapter.ts
 *
 * Meilisearch provider adapter.
 * The ONLY file that imports the meilisearch SDK.
 */

import MeiliSearch from "meilisearch";
import type {
  ISearchProvider,
  SearchResult,
  SearchIndexDocument,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export class MeilisearchAdapter implements ISearchProvider {
  readonly name = "meilisearch";
  private readonly client: MeiliSearch;

  constructor(host: string, apiKey: string) {
    this.client = new MeiliSearch({ host, apiKey });
  }

  private indexName(siteId: string): string {
    return `posts_${siteId}`;
  }

  async index(documents: SearchIndexDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const siteId = documents[0]!.siteId;
    try {
      const idx = this.client.index(this.indexName(siteId));
      await idx.addDocuments(documents.map((d) => ({ ...d, objectID: d.id })));
    } catch (err) {
      throw new ProviderError(
        "meilisearch",
        `Failed to index documents: ${String(err)}`
      );
    }
  }

  async delete(id: string, siteId: string): Promise<void> {
    try {
      const idx = this.client.index(this.indexName(siteId));
      await idx.deleteDocument(id);
    } catch (err) {
      throw new ProviderError(
        "meilisearch",
        `Failed to delete document: ${String(err)}`
      );
    }
  }

  async search(
    siteId: string,
    query: string,
    options?: { limit?: number; page?: number }
  ): Promise<SearchResult[]> {
    const limit = Math.min(options?.limit ?? 15, 100);
    const page = options?.page ?? 1;

    try {
      const idx = this.client.index(this.indexName(siteId));
      const result = await idx.search(query, {
        limit,
        offset: (page - 1) * limit,
        attributesToHighlight: ["title", "excerpt"],
        attributesToRetrieve: ["id", "title", "slug", "excerpt"],
        filter: "status = 'published'",
      });

      return result.hits.map((hit) => ({
        id: hit["id"] as string,
        title: hit["title"] as string,
        slug: hit["slug"] as string,
        excerpt: (hit["excerpt"] as string) ?? "",
        score: (hit as { _rankingScore?: number })._rankingScore ?? 1,
      }));
    } catch (err) {
      throw new ProviderError("meilisearch", `Search failed: ${String(err)}`);
    }
  }
}
