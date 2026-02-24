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
 *
 * All worker files are in apps/api/src/workers/.
 * Workers are started via `startAllWorkers()`, called from the API entry point.
 *
 * Per AGENTS.md: workers receive all dependencies via DI — no direct DB access
 * or provider resolution inside worker files.
 */

import { createScheduledPublishWorker } from "./scheduled-publish.worker";
import { createNewsletterSendWorker } from "./newsletter-send.worker";
import { createWebhookDeliverWorker } from "./webhook-deliver.worker";
import { createWelcomeEmailWorker } from "./welcome-email.worker";
import { createSearchIndexWorker } from "./search-index.worker";
import { logger } from "../lib/logger";
import type { PostRepository } from "../repositories/post.repository";
import type { NewsletterRepository } from "../repositories/newsletter.repository";
import type { WebhookRepository } from "../repositories/webhook.repository";
import type {
  IEmailProvider,
  ISearchProvider,
} from "@cms/core/types/providers";

export interface WorkerDeps {
  postRepo: PostRepository;
  newsletterRepo: NewsletterRepository;
  webhookRepo: WebhookRepository;
  emailProvider: IEmailProvider | null;
  searchProvider: ISearchProvider;
}

export function startAllWorkers(redisUrl: string, deps: WorkerDeps): void {
  const workers = [
    createScheduledPublishWorker(redisUrl, { postRepo: deps.postRepo }),
    ...(deps.emailProvider
      ? [
          createNewsletterSendWorker(redisUrl, {
            newsletterRepo: deps.newsletterRepo,
            emailProvider: deps.emailProvider,
          }),
          createWelcomeEmailWorker(redisUrl, {
            emailProvider: deps.emailProvider,
          }),
        ]
      : []),
    createWebhookDeliverWorker(redisUrl, { webhookRepo: deps.webhookRepo }),
    createSearchIndexWorker(redisUrl, { searchProvider: deps.searchProvider }),
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
