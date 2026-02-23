/**
 * apps/api/src/workers/newsletter-send.worker.ts
 *
 * Fans out newsletter email delivery to all subscribers of a newsletter.
 * Queue name: "newsletter-send"
 * Job data: { siteId: string; sendId: string; newsletterId: string; subject: string; html: string }
 */

import { Worker } from "bullmq";
import { resolveEmailProvider } from "../providers/email/index";
import { db } from "@cms/core/db/client";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { MemberRepository } from "../repositories/member.repository";
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

export function createNewsletterSendWorker(redisUrl: string): Worker {
  const emailProvider = resolveEmailProvider();
  const newsletterRepo = new NewsletterRepository(db);

  return new Worker<NewsletterSendJobData>(
    "newsletter-send",
    async (job) => {
      const { sendId, newsletterId, subject, html, fromEmail, fromName } = job.data;
      logger.info(`Processing newsletter send ${sendId}`);

      // Get subscriber emails for this newsletter
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

      // Send emails in batches of 50
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
