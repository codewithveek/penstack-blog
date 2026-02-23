/**
 * apps/api/src/workers/welcome-email.worker.ts
 *
 * Sends a welcome email when a new member signs up.
 * Queue name: "welcome-email"
 * Job data: { email: string; name: string; siteName: string; siteUrl: string }
 */

import { Worker } from "bullmq";
import { resolveEmailProvider } from "../providers/email/index";
import { logger } from "../lib/logger";

interface WelcomeEmailJobData {
  email: string;
  name: string;
  siteName: string;
  siteUrl: string;
  fromEmail: string;
}

export function createWelcomeEmailWorker(redisUrl: string): Worker {
  const emailProvider = resolveEmailProvider();

  return new Worker<WelcomeEmailJobData>(
    "welcome-email",
    async (job) => {
      const { email, name, siteName, siteUrl, fromEmail } = job.data;
      logger.info(`Sending welcome email to ${email}`);

      await emailProvider.send({
        to: { email },
        from: { email: fromEmail, name: siteName },
        subject: `Welcome to ${siteName}!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Welcome to ${escapeHtml(siteName)}!</h1>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              Hi ${escapeHtml(name)},
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              Thank you for subscribing. You now have access to all free content.
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              <a href="${escapeHtml(siteUrl)}" style="color: #6366f1; text-decoration: none;">
                Visit ${escapeHtml(siteName)} &rarr;
              </a>
            </p>
          </div>
        `,
      });

      logger.info(`Welcome email sent to ${email}`);
    },
    {
      connection: { url: redisUrl },
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    }
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
