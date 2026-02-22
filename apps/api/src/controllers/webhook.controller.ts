/**
 * apps/api/src/controllers/webhook.controller.ts
 */

import type { WebhookService } from "../services/webhook.service";
import type { Webhook, WebhookDelivery } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";

export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  async getById(siteId: string, id: string): Promise<Webhook> {
    return this.webhookService.getById(siteId, id);
  }

  async create(
    siteId: string,
    input: { targetUrl: string; events: string[]; secret?: string }
  ): Promise<Webhook> {
    return this.webhookService.createWebhook(siteId, input);
  }

  async update(
    siteId: string,
    id: string,
    input: Partial<{ targetUrl: string; events: string[]; active: boolean }>
  ): Promise<Webhook> {
    return this.webhookService.updateWebhook(siteId, id, input);
  }

  async delete(siteId: string, id: string): Promise<void> {
    return this.webhookService.deleteWebhook(siteId, id);
  }

  async listDeliveries(
    siteId: string,
    webhookId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WebhookDelivery>> {
    return this.webhookService.listDeliveries(siteId, webhookId, pagination);
  }
}
