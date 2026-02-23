/**
 * apps/api/src/workers/search-index.worker.ts
 *
 * Index / deindex posts in the search provider.
 * Queue name: "search-index"
 * Job names: "index" | "deindex"
 */

import { Worker } from "bullmq";
import { resolveSearchProvider } from "../providers/search/index";
import { db } from "@cms/core/db/client";
import type { SearchDocument } from "@cms/core/types/providers";
import { logger } from "../lib/logger";

interface SearchIndexJobData {
  action: "index" | "deindex";
  siteId: string;
  postId: string;
  title?: string;
  excerpt?: string;
  tags?: string[];
  type?: "post" | "page";
  publishedAt?: string;
  url?: string;
}

export function createSearchIndexWorker(redisUrl: string): Worker {
  const searchProvider = resolveSearchProvider(db);

  return new Worker<SearchIndexJobData>(
    "search-index",
    async (job) => {
      const { action, siteId, postId } = job.data;

      if (action === "deindex") {
        logger.info(`Deindexing post ${postId} from search`);
        await searchProvider.delete(siteId, postId);
        return;
      }

      // Index
      logger.info(`Indexing post ${postId} in search`);
      const doc: SearchDocument = {
        id: postId,
        siteId,
        type: job.data.type ?? "post",
        title: job.data.title ?? "",
      };
      if (job.data.excerpt !== undefined) {
        doc.excerpt = job.data.excerpt;
      }
      if (job.data.tags !== undefined) {
        doc.tags = job.data.tags;
      }
      if (job.data.publishedAt !== undefined) {
        doc.publishedAt = new Date(job.data.publishedAt);
      }
      if (job.data.url !== undefined) {
        doc.url = job.data.url;
      }

      await searchProvider.index([doc]);
      logger.info(`Post ${postId} indexed successfully`);
    },
    {
      connection: { url: redisUrl },
      concurrency: 5,
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 500 },
    }
  );
}
