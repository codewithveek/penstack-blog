/**
 * apps/api/src/workers/newsletter-send.worker.ts
 *
 * Fans out newsletter email delivery to all subscribers of a newsletter.
 * Queue name: "newsletter-send"
 * Job data: { siteId, sendId, newsletterId, subject, html, fromEmail, fromName }
 *
 * Per AGENTS.md: repos and providers are injected via DI — no direct DB access.
 */

import { Worker } from "bullmq";
import type { NewsletterRepository } from "../repositories/newsletter.repository";
import type { IEmailProvider } from "@cms/core/types/providers";
import { logger } from "../lib/logger";

interface NewsletterSendJobData {
  siteId: string;
  sendId: string;
  newsletterId: string;
  subject: string;
  html: string;
  fromEmail: string;
  fromName: string;
}

export interface NewsletterSendWorkerDeps {
  newsletterRepo: NewsletterRepository;
  emailProvider: IEmailProvider;
}

export function createNewsletterSendWorker(
  redisUrl: string,
  deps: NewsletterSendWorkerDeps
): Worker {
  const { newsletterRepo, emailProvider } = deps;

  return new Worker<NewsletterSendJobData>(
    "newsletter-send",
    async (job) => {
      const { sendId, newsletterId, subject, html, fromEmail, fromName } = job.data;
      logger.info(`Processing newsletter send ${sendId}`);

      const emails = await newsletterRepo.getNewsletterSubscriberEmails(newsletterId);

      if (emails.length === 0) {
        logger.info(`No subscribers for newsletter ${newsletterId}, skipping`);
        await newsletterRepo.updateEmailSend(sendId, {
          status: "sent",
          sent_at: new Date(),
          recipient_count: 0,
        });
        return;
      }

      let successCount = 0;
      let failCount = 0;

      const batchSize = 50;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map((email) =>
            emailProvider.send({
              to: { email },
              from: { email: fromEmail, name: fromName },
              subject,
              html,
            })
          )
        );

        for (const result of results) {
          if (result.status === "fulfilled") {
            successCount++;
          } else {
            failCount++;
            logger.error(`Failed to send newsletter email`, { error: result.reason });
          }
        }
      }

      await newsletterRepo.updateEmailSend(sendId, {
        status: failCount > 0 && successCount === 0 ? "failed" : "sent",
        sent_at: new Date(),
        recipient_count: successCount,
      });

      logger.info(`Newsletter send ${sendId} complete: ${successCount} sent, ${failCount} failed`);
    },
    {
      connection: { url: redisUrl },
      concurrency: 2,
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 200 },
    }
  );
}
