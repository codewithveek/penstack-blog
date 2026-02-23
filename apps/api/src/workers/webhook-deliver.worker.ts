/**
 * apps/api/src/workers/webhook-deliver.worker.ts
 *
 * Delivers webhook payloads to registered endpoints with exponential retry.
 * Queue name: "webhook-deliver"
 * Job data: { webhookId, deliveryId, targetUrl, secret, eventType, payload }
 *
 * Per AGENTS.md: repo injected via DI — no direct DB access.
 */

import crypto from "node:crypto";
import { Worker } from "bullmq";
import type { WebhookRepository } from "../repositories/webhook.repository";
import type { WebhookDelivery } from "@cms/core/db/schema";
import { logger } from "../lib/logger";

interface WebhookDeliverJobData {
  webhookId: string;
  deliveryId: string;
  targetUrl: string;
  secret: string;
  eventType: string;
  payload: string;
}

export interface WebhookDeliverWorkerDeps {
  webhookRepo: WebhookRepository;
}

export function createWebhookDeliverWorker(
  redisUrl: string,
  deps: WebhookDeliverWorkerDeps
): Worker {
  const { webhookRepo } = deps;

  return new Worker<WebhookDeliverJobData>(
    "webhook-deliver",
    async (job) => {
      const { deliveryId, targetUrl, secret, eventType, payload } = job.data;
      logger.info(`Delivering webhook ${deliveryId} to ${targetUrl}`);

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

        const deliveryUpdate: Partial<Omit<WebhookDelivery, "id" | "webhook_id" | "created_at">> = {
          status: response.ok ? "success" : "failed",
          http_status: String(response.status),
          response_body: responseBody.slice(0, 2000),
          attempt_count: String(attemptNumber),
        };
        if (response.ok) {
          deliveryUpdate.delivered_at = new Date();
        }
        await webhookRepo.updateDelivery(deliveryId, deliveryUpdate);

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
        throw err;
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
