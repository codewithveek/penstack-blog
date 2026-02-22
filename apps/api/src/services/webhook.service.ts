/**
 * apps/api/src/services/webhook.service.ts
 *
 * Webhook management and delivery.
 * Webhook delivery uses constant-time signature comparison per AGENTS.md §11.
 */

import crypto from "node:crypto";
import type { IWebhookRepository } from "@cms/core/types/repositories";
import type { Webhook, WebhookDelivery } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError } from "@cms/core/errors";
import { logger } from "../lib/logger";

export interface WebhookEventPayload {
  event: string;
  siteId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export class WebhookService {
  constructor(private readonly webhookRepo: IWebhookRepository) {}

  async getById(siteId: string, id: string): Promise<Webhook> {
    const hook = await this.webhookRepo.findById(siteId, id);
    if (!hook) throw new NotFoundError("Webhook", id);
    return hook;
  }

  async createWebhook(
    siteId: string,
    input: {
      targetUrl: string;
      events: string[];
      secret?: string;
    }
  ): Promise<Webhook> {
    const secret = input.secret ?? crypto.randomBytes(32).toString("hex");

    return this.webhookRepo.create({
      id: crypto.randomUUID(),
      site_id: siteId,
      target_url: input.targetUrl,
      events: input.events,
      secret,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async updateWebhook(
    siteId: string,
    id: string,
    input: Partial<{ targetUrl: string; events: string[]; active: boolean }>
  ): Promise<Webhook> {
    const hook = await this.webhookRepo.findById(siteId, id);
    if (!hook) throw new NotFoundError("Webhook", id);

    return this.webhookRepo.update(siteId, id, {
      ...(input.targetUrl && { target_url: input.targetUrl }),
      ...(input.events && { events: input.events }),
      ...(input.active !== undefined && { active: input.active }),
    });
  }

  async deleteWebhook(siteId: string, id: string): Promise<void> {
    const hook = await this.webhookRepo.findById(siteId, id);
    if (!hook) throw new NotFoundError("Webhook", id);
    await this.webhookRepo.delete(siteId, id);
  }

  async listDeliveries(
    siteId: string,
    webhookId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WebhookDelivery>> {
    return this.webhookRepo.findDeliveries(siteId, webhookId, pagination);
  }

  /**
   * Fire webhooks for a given event. Called by services after domain events.
   * Deliveries are fire-and-forget; failures are logged not propagated.
   */
  async dispatch(
    siteId: string,
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const hooks = await this.webhookRepo.findByEvent(siteId, event);
    if (hooks.length === 0) return;

    const payload: WebhookEventPayload = {
      event,
      siteId,
      timestamp: new Date().toISOString(),
      data,
    };

    await Promise.allSettled(hooks.map((hook) => this.deliver(hook, payload)));
  }

  private async deliver(
    hook: Webhook,
    payload: WebhookEventPayload
  ): Promise<void> {
    const body = JSON.stringify(payload);
    let status = 0;
    let responseBody = "";
    const deliveredAt = new Date();

    try {
      const signature = this.sign(hook.secret ?? "", body);

      const res = await fetch(hook.target_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CMS-Event": payload.event,
          "X-CMS-Signature": `sha256=${signature}`,
          "X-CMS-Timestamp": payload.timestamp,
        },
        body,
        signal: AbortSignal.timeout(10_000), // 10s timeout
      });

      status = res.status;
      responseBody = await res.text().catch(() => "");
    } catch (err) {
      logger.warn("Webhook delivery failed", {
        hookId: hook.id,
        url: hook.target_url,
        err: String(err),
      });
      responseBody = String(err);
    }

    // Log delivery
    await this.webhookRepo
      .createDelivery({
        id: crypto.randomUUID(),
        site_id: hook.site_id,
        webhook_id: hook.id,
        event: payload.event,
        request_body: body,
        response_status: status,
        response_body: responseBody.slice(0, 2000),
        success: status >= 200 && status < 300,
        created_at: deliveredAt,
      })
      .catch((err) => logger.error("Failed to log webhook delivery", err));
  }

  private sign(secret: string, body: string): string {
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }

  /**
   * Verify an incoming webhook signature using constant-time comparison.
   * Per AGENTS.md §11: never use === for signature comparison.
   */
  static verifySignature(
    secret: string,
    body: string,
    signature: string
  ): boolean {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(signature.replace(/^sha256=/, ""), "hex");

    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  }
}
