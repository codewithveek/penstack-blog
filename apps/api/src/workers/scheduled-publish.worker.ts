/**
 * apps/api/src/workers/scheduled-publish.worker.ts
 *
 * Picks up posts whose scheduled_at timestamp has arrived and publishes them.
 * Queue name: "scheduled-publish"
 * Job data: { siteId: string; postId: string }
 *
 * Per AGENTS.md: no direct DB access — delegates to PostRepository via DI.
 */

import { Worker } from "bullmq";
import type { PostRepository } from "../repositories/post.repository";
import { logger } from "../lib/logger";

interface ScheduledPublishJobData {
  siteId: string;
  postId: string;
}

export interface ScheduledPublishWorkerDeps {
  postRepo: PostRepository;
}

export function createScheduledPublishWorker(
  redisUrl: string,
  deps: ScheduledPublishWorkerDeps
): Worker {
  const { postRepo } = deps;

  return new Worker<ScheduledPublishJobData>(
    "scheduled-publish",
    async (job) => {
      const { siteId, postId } = job.data;
      logger.info(`Publishing scheduled post ${postId} for site ${siteId}`);

      const post = await postRepo.findById(siteId, postId);
      if (!post) {
        logger.warn(`Scheduled post ${postId} not found, skipping`);
        return;
      }
      if (post.status !== "scheduled") {
        logger.warn(`Post ${postId} is no longer scheduled (status: ${post.status}), skipping`);
        return;
      }

      const permalink = post.permalink ?? `/${post.slug}`;
      await postRepo.publish(siteId, postId, permalink);

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
