/**
 * apps/api/src/repositories/newsletter.repository.ts
 *
 * Newsletters, member subscriptions, email sends, recipients, and events.
 * Implements INewsletterRepository.
 */

import crypto from "node:crypto";
import { eq, and, sql, desc } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import {
  newsletters,
  memberNewsletters,
  emailSends,
  emailSendRecipients,
  members,
} from "@cms/core/db/schema";
import type {
  Newsletter,
  EmailSend,
  EmailSendRecipient,
} from "@cms/core/db/schema";
import type {
  INewsletterRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class NewsletterRepository implements INewsletterRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<Newsletter | null> {
    try {
      const rows = await this.db
        .select()
        .from(newsletters)
        .where(and(eq(newsletters.site_id, siteId), eq(newsletters.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find newsletter by id", "findById", err);
    }
  }

  async findBySlug(siteId: string, slug: string): Promise<Newsletter | null> {
    try {
      const rows = await this.db
        .select()
        .from(newsletters)
        .where(and(eq(newsletters.site_id, siteId), eq(newsletters.slug, slug)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find newsletter by slug", "findBySlug", err);
    }
  }

  async findMany(siteId: string, pagination: PaginationParams): Promise<PaginatedResult<Newsletter>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;
    try {
      const [rows, [countRow]] = await Promise.all([
        this.db.select().from(newsletters).where(eq(newsletters.site_id, siteId)).limit(limit).offset(offset),
        this.db.select({ count: sql<number>`count(*)` }).from(newsletters).where(eq(newsletters.site_id, siteId)),
      ]);
      const total = countRow?.count ?? 0;
      return { data: rows, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    } catch (err) {
      throw new RepositoryError("Failed to list newsletters", "findMany", err);
    }
  }

  async create(data: Omit<Newsletter, "id" | "created_at" | "updated_at">): Promise<Newsletter> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(newsletters).values({ ...data, id });
      const created = await this.findById(data.site_id, id);
      if (!created) throw new RepositoryError("Newsletter not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create newsletter", "create", err);
    }
  }

  async update(siteId: string, id: string, data: Partial<Newsletter>): Promise<Newsletter> {
    try {
      await this.db
        .update(newsletters)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(newsletters.site_id, siteId), eq(newsletters.id, id)));
      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Newsletter", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to update newsletter", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db.delete(newsletters).where(and(eq(newsletters.site_id, siteId), eq(newsletters.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete newsletter", "delete", err);
    }
  }

  async createEmailSend(data: Omit<EmailSend, "id" | "created_at" | "updated_at">): Promise<EmailSend> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(emailSends).values({ ...data, id });
      const rows = await this.db.select().from(emailSends).where(eq(emailSends.id, id)).limit(1);
      if (!rows[0]) throw new RepositoryError("EmailSend not found after insert", "createEmailSend");
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create email send", "createEmailSend", err);
    }
  }

  async getEmailSend(id: string): Promise<EmailSend | null> {
    try {
      const rows = await this.db.select().from(emailSends).where(eq(emailSends.id, id)).limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to get email send", "getEmailSend", err);
    }
  }

  async updateEmailSend(id: string, data: Partial<EmailSend>): Promise<EmailSend> {
    try {
      await this.db.update(emailSends).set({ ...data, updated_at: new Date() }).where(eq(emailSends.id, id));
      const rows = await this.db.select().from(emailSends).where(eq(emailSends.id, id)).limit(1);
      if (!rows[0]) throw new NotFoundError("EmailSend", id);
      return rows[0];
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to update email send", "updateEmailSend", err);
    }
  }

  async createEmailSendRecipient(sendId: string, memberId: string, trackingId: string): Promise<EmailSendRecipient> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(emailSendRecipients).values({ id, email_send_id: sendId, member_id: memberId, tracking_id: trackingId });
      const rows = await this.db.select().from(emailSendRecipients).where(eq(emailSendRecipients.id, id)).limit(1);
      if (!rows[0]) throw new RepositoryError("EmailSendRecipient not found after insert", "createEmailSendRecipient");
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create email send recipient", "createEmailSendRecipient", err);
    }
  }

  async getNewsletterSubscriberEmails(newsletterId: string): Promise<string[]> {
    try {
      const rows = await this.db
        .select({ email: members.email })
        .from(memberNewsletters)
        .innerJoin(members, eq(memberNewsletters.member_id, members.id))
        .where(eq(memberNewsletters.newsletter_id, newsletterId));
      return rows.map((r) => r.email);
    } catch (err) {
      throw new RepositoryError("Failed to get newsletter subscriber emails", "getNewsletterSubscriberEmails", err);
    }
  }

  async getNewsletterSubscriberCount(newsletterId: string): Promise<number> {
    try {
      const [row] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(memberNewsletters)
        .where(eq(memberNewsletters.newsletter_id, newsletterId));
      return row?.count ?? 0;
    } catch (err) {
      throw new RepositoryError("Failed to get newsletter subscriber count", "getNewsletterSubscriberCount", err);
    }
  }
}
