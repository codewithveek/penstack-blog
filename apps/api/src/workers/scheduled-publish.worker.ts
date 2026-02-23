/**
 * apps/api/src/workers/scheduled-publish.worker.ts
 *
 * Picks up posts whose scheduled_at timestamp has arrived and publishes them.
 * Queue name: "scheduled-publish"
 * Job data: { siteId: string; postId: string }
 */

import { Worker } from "bullmq";
import { db } from "@cms/core/db/client";
import { posts } from "@cms/core/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

interface ScheduledPublishJobData {
  siteId: string;
  postId: string;
}

export function createScheduledPublishWorker(redisUrl: string): Worker {
  return new Worker<ScheduledPublishJobData>(
    "scheduled-publish",
    async (job) => {
      const { siteId, postId } = job.data;
      logger.info(`Publishing scheduled post ${postId} for site ${siteId}`);

      await db
        .update(posts)
        .set({
          status: "published",
          published_at: new Date(),
          updated_at: new Date(),
        })
        .where(
          and(
            eq(posts.id, postId),
            eq(posts.site_id, siteId),
            eq(posts.status, "scheduled")
          )
        );

      logger.info(`Scheduled post ${postId} published successfully`);
    },
    {
      connection: { url: redisUrl },
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    }
  );
}
