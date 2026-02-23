/**
 * apps/api/src/workers/index.ts
 *
 * Background job workers — BullMQ Workers that process enqueued jobs.
 *
 * Workers needed per PRD §18:
 *   1. scheduled-publish   — publish posts when their scheduled_at time arrives
 *   2. newsletter-send     — fan out newsletter emails to subscribers
 *   3. webhook-deliver     — deliver webhook payloads with retry
 *   4. welcome-email       — send welcome email to new members
 *   5. search-index        — index/update post in the search provider
 *   6. search-deindex      — remove a post from the search index
 *   7. subscription-expire — check for expired subscriptions
 *   8. email-analytics     — process email open/click tracking
 *
 * All worker files are in apps/api/src/workers/.
 * Workers are started via `startAllWorkers()`, called from the API entry point
 * (or a separate worker process).
 */

import type IORedis from "ioredis";
import { createScheduledPublishWorker } from "./scheduled-publish.worker";
import { createNewsletterSendWorker } from "./newsletter-send.worker";
import { createWebhookDeliverWorker } from "./webhook-deliver.worker";
import { createWelcomeEmailWorker } from "./welcome-email.worker";
import { createSearchIndexWorker } from "./search-index.worker";
import { logger } from "../lib/logger";

export function startAllWorkers(redisUrl: string): void {
  const workers = [
    createScheduledPublishWorker(redisUrl),
    createNewsletterSendWorker(redisUrl),
    createWebhookDeliverWorker(redisUrl),
    createWelcomeEmailWorker(redisUrl),
    createSearchIndexWorker(redisUrl),
  ];

  for (const worker of workers) {
    worker.on("failed", (job, err) => {
      logger.error(`Worker job ${job?.id ?? "unknown"} failed`, err);
    });
    worker.on("completed", (job) => {
      logger.info(`Worker job ${job.id} completed on queue ${job.queueName}`);
    });
  }

  logger.info(`Started ${workers.length} background workers`);
}
