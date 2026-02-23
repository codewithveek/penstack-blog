/**
 * apps/api/src/workers/webhook-deliver.worker.ts
 *
 * Delivers webhook payloads to registered endpoints with exponential retry.
 * Queue name: "webhook-deliver"
 * Job data: { webhookId: string; deliveryId: string; targetUrl: string; secret: string; eventType: string; payload: string }
 */

import crypto from "node:crypto";
import { Worker } from "bullmq";
import { db } from "@cms/core/db/client";
import { WebhookRepository } from "../repositories/webhook.repository";
import { logger } from "../lib/logger";

interface WebhookDeliverJobData {
  webhookId: string;
  deliveryId: string;
  targetUrl: string;
  secret: string;
  eventType: string;
  payload: string;
}

export function createWebhookDeliverWorker(redisUrl: string): Worker {
  const webhookRepo = new WebhookRepository(db);

  return new Worker<WebhookDeliverJobData>(
    "webhook-deliver",
    async (job) => {
      const { deliveryId, targetUrl, secret, eventType, payload } = job.data;
      logger.info(`Delivering webhook ${deliveryId} to ${targetUrl}`);

      // Sign payload with HMAC-SHA256
      const signature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      const attemptNumber = (job.attemptsMade ?? 0) + 1;

      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CMS-Event": eventType,
            "X-CMS-Signature": `sha256=${signature}`,
            "X-CMS-Delivery": deliveryId,
            "User-Agent": "PenstackCMS-Webhook/1.0",
          },
          body: payload,
          signal: AbortSignal.timeout(30000),
        });

        const responseBody = await response.text().catch(() => "");

        const updateData: Record<string, unknown> = {
          status: response.ok ? "success" as const : "failed" as const,
          http_status: String(response.status),
          response_body: responseBody.slice(0, 2000),
          attempt_count: String(attemptNumber),
        };
        if (response.ok) {
          updateData.delivered_at = new Date();
        }
        await webhookRepo.updateDelivery(deliveryId, updateData as Partial<import("@cms/core/db/schema").WebhookDelivery>);

        if (!response.ok) {
          throw new Error(`Webhook delivery failed with status ${response.status}`);
        }

        logger.info(`Webhook ${deliveryId} delivered successfully`);
      } catch (err) {
        await webhookRepo.updateDelivery(deliveryId, {
          status: "failed",
          attempt_count: String(attemptNumber),
          response_body: err instanceof Error ? err.message : String(err),
        });
        throw err; // Let BullMQ retry
      }
    },
    {
      connection: { url: redisUrl },
      concurrency: 10,
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 500 },
    }
  );
}
