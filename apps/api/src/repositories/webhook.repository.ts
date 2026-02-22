/**
 * apps/api/src/repositories/webhook.repository.ts
 *
 * Webhooks and delivery log.
 * Implements IWebhookRepository.
 * NOTE: webhook `secret` is encrypted before write, decrypted after read.
 */

import { eq, and, sql, desc } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { webhooks, webhookDeliveries } from "@cms/core/db/schema";
import type {
  Webhook,
  WebhookDelivery,
} from "@cms/core/db/schema";
import type {
  IWebhookRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";
import { encrypt, decrypt } from "@cms/core/utils/encryption";

export class WebhookRepository implements IWebhookRepository {
  constructor(private readonly db: DB) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private encryptWebhook(data: Omit<Webhook, "id" | "created_at">): Omit<Webhook, "id" | "created_at"> {
    return {
      ...data,
      secret: data.secret ? encrypt(data.secret) : data.secret,
    };
  }

  private decryptWebhook(row: Webhook): Webhook {
    return {
      ...row,
      secret: row.secret ? decrypt(row.secret) : row.secret,
    };
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────────

  async findById(siteId: string, id: string): Promise<Webhook | null> {
    try {
      const rows = await this.db
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.site_id, siteId), eq(webhooks.id, id)))
        .limit(1);
      if (!rows[0]) return null;
      return this.decryptWebhook(rows[0]);
    } catch (err) {
      throw new RepositoryError(
        "Failed to find webhook by id",
        "findById",
        err
      );
    }
  }

  async findBySiteId(siteId: string): Promise<Webhook[]> {
    try {
      const rows = await this.db
        .select()
        .from(webhooks)
        .where(eq(webhooks.site_id, siteId));
      return rows.map((r) => this.decryptWebhook(r));
    } catch (err) {
      throw new RepositoryError(
        "Failed to find webhooks for site",
        "findBySiteId",
        err
      );
    }
  }

  async findMany(
    siteId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Webhook>> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(webhooks)
          .where(eq(webhooks.site_id, siteId))
          .orderBy(desc(webhooks.created_at))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(webhooks)
          .where(eq(webhooks.site_id, siteId)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows.map((r) => this.decryptWebhook(r)),
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list webhooks", "findMany", err);
    }
  }

  async findByEvent(siteId: string, event: string): Promise<Webhook[]> {
    try {
      // event_triggers is a comma-separated string: "post.published,member.created"
      const rows = await this.db
        .select()
        .from(webhooks)
        .where(
          and(
            eq(webhooks.site_id, siteId),
            eq(webhooks.active, true),
            sql`FIND_IN_SET(${event}, ${webhooks.event_triggers}) > 0`
          )
        );
      return rows.map((r) => this.decryptWebhook(r));
    } catch (err) {
      throw new RepositoryError(
        "Failed to find webhooks by event",
        "findByEvent",
        err
      );
    }
  }

  async create(data: Omit<Webhook, "id" | "created_at">): Promise<Webhook> {
    const id = crypto.randomUUID();
    try {
      const encrypted = this.encryptWebhook(data);
      await this.db.insert(webhooks).values({ ...encrypted, id });
      const created = await this.findById(data.site_id, id);
      if (!created)
        throw new RepositoryError("Webhook not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create webhook", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<Omit<Webhook, "id" | "site_id" | "created_at">>
  ): Promise<Webhook> {
    try {
      const toSet = { ...data } as Partial<Webhook>;
      if (toSet.secret) toSet.secret = encrypt(toSet.secret);

      await this.db
        .update(webhooks)
        .set(toSet)
        .where(and(eq(webhooks.site_id, siteId), eq(webhooks.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Webhook", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update webhook", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(webhooks)
        .where(and(eq(webhooks.site_id, siteId), eq(webhooks.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete webhook", "delete", err);
    }
  }

  // ─── Delivery log ─────────────────────────────────────────────────────────────

  async createDelivery(data: Omit<WebhookDelivery, "id" | "created_at">): Promise<WebhookDelivery> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(webhookDeliveries).values({ ...data, id });
      const rows = await this.db
        .select()
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.id, id))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError(
          "WebhookDelivery not found after insert",
          "createDelivery"
        );
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create webhook delivery",
        "createDelivery",
        err
      );
    }
  }

  async findDeliveries(
    siteId: string,
    webhookId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WebhookDelivery>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(webhookDeliveries)
          .where(eq(webhookDeliveries.webhook_id, webhookId))
          .orderBy(desc(webhookDeliveries.created_at))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(webhookDeliveries)
          .where(eq(webhookDeliveries.webhook_id, webhookId)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError(
        "Failed to list webhook deliveries",
        "findDeliveries",
        err
      );
    }
  }
}
