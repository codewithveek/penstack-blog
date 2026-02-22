/**
 * apps/api/src/repositories/newsletter.repository.ts
 *
 * Newsletters, member subscriptions, email sends, recipients, and events.
 * Implements INewsletterRepository.
 */

import { eq, and, sql, desc } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import {
  newsletters,
  memberNewsletters,
  emailSends,
  emailSendRecipients,
  emailEvents,
} from "@cms/core/db/schema";
import type {
  Newsletter,
  NewNewsletter,
  MemberNewsletter,
  NewMemberNewsletter,
  EmailSend,
  NewEmailSend,
  EmailSendRecipient,
  NewEmailSendRecipient,
  EmailEvent,
  NewEmailEvent,
} from "@cms/core/db/schema";
import type {
  INewsletterRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class NewsletterRepository implements INewsletterRepository {
  constructor(private readonly db: DB) {}

  // ─── Newsletters ─────────────────────────────────────────────────────────────

  async findById(siteId: string, id: string): Promise<Newsletter | null> {
    try {
      const rows = await this.db
        .select()
        .from(newsletters)
        .where(and(eq(newsletters.site_id, siteId), eq(newsletters.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find newsletter by id",
        "findById",
        err
      );
    }
  }

  async findDefault(siteId: string): Promise<Newsletter | null> {
    try {
      const rows = await this.db
        .select()
        .from(newsletters)
        .where(
          and(eq(newsletters.site_id, siteId), eq(newsletters.is_default, true))
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find default newsletter",
        "findDefault",
        err
      );
    }
  }

  async findMany(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Newsletter>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(newsletters)
          .where(eq(newsletters.site_id, siteId))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(newsletters)
          .where(eq(newsletters.site_id, siteId)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list newsletters", "findMany", err);
    }
  }

  async create(data: NewNewsletter): Promise<Newsletter> {
    try {
      await this.db.insert(newsletters).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError(
          "Newsletter not found after insert",
          "create"
        );
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create newsletter", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewNewsletter>
  ): Promise<Newsletter> {
    try {
      await this.db
        .update(newsletters)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(newsletters.site_id, siteId), eq(newsletters.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Newsletter", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update newsletter", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(newsletters)
        .where(and(eq(newsletters.site_id, siteId), eq(newsletters.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete newsletter", "delete", err);
    }
  }

  // ─── Member subscriptions to newsletters ─────────────────────────────────────

  async subscribeMember(data: NewMemberNewsletter): Promise<void> {
    try {
      await this.db
        .insert(memberNewsletters)
        .values(data)
        .onDuplicateKeyUpdate({ set: { subscribed: true } });
    } catch (err) {
      throw new RepositoryError(
        "Failed to subscribe member to newsletter",
        "subscribeMember",
        err
      );
    }
  }

  async unsubscribeMember(
    siteId: string,
    memberId: string,
    newsletterId: string
  ): Promise<void> {
    try {
      await this.db
        .update(memberNewsletters)
        .set({ subscribed: false })
        .where(
          and(
            eq(memberNewsletters.site_id, siteId),
            eq(memberNewsletters.member_id, memberId),
            eq(memberNewsletters.newsletter_id, newsletterId)
          )
        );
    } catch (err) {
      throw new RepositoryError(
        "Failed to unsubscribe member",
        "unsubscribeMember",
        err
      );
    }
  }

  async getSubscriberCount(
    siteId: string,
    newsletterId: string
  ): Promise<number> {
    try {
      const [row] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(memberNewsletters)
        .where(
          and(
            eq(memberNewsletters.site_id, siteId),
            eq(memberNewsletters.newsletter_id, newsletterId),
            eq(memberNewsletters.subscribed, true)
          )
        );
      return row?.count ?? 0;
    } catch (err) {
      throw new RepositoryError(
        "Failed to get subscriber count",
        "getSubscriberCount",
        err
      );
    }
  }

  // ─── Email sends ──────────────────────────────────────────────────────────────

  async createEmailSend(data: NewEmailSend): Promise<EmailSend> {
    try {
      await this.db.insert(emailSends).values(data);
      const rows = await this.db
        .select()
        .from(emailSends)
        .where(eq(emailSends.id, data.id))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError(
          "EmailSend not found after insert",
          "createEmailSend"
        );
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create email send",
        "createEmailSend",
        err
      );
    }
  }

  async updateEmailSend(
    id: string,
    data: Partial<NewEmailSend>
  ): Promise<EmailSend> {
    try {
      await this.db.update(emailSends).set(data).where(eq(emailSends.id, id));
      const rows = await this.db
        .select()
        .from(emailSends)
        .where(eq(emailSends.id, id))
        .limit(1);
      if (!rows[0]) throw new NotFoundError("EmailSend", id);
      return rows[0];
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError(
        "Failed to update email send",
        "updateEmailSend",
        err
      );
    }
  }

  async findEmailSendsByNewsletter(
    siteId: string,
    newsletterId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EmailSend>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 15, 100);
    const offset = (page - 1) * limit;

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(emailSends)
          .where(
            and(
              eq(emailSends.site_id, siteId),
              eq(emailSends.newsletter_id, newsletterId)
            )
          )
          .orderBy(desc(emailSends.created_at))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(emailSends)
          .where(
            and(
              eq(emailSends.site_id, siteId),
              eq(emailSends.newsletter_id, newsletterId)
            )
          ),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError(
        "Failed to list email sends",
        "findEmailSendsByNewsletter",
        err
      );
    }
  }

  async createEmailSendRecipients(
    data: NewEmailSendRecipient[]
  ): Promise<void> {
    if (data.length === 0) return;
    try {
      // batch insert in chunks of 500 to avoid max_allowed_packet issues
      const CHUNK_SIZE = 500;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        await this.db
          .insert(emailSendRecipients)
          .values(data.slice(i, i + CHUNK_SIZE));
      }
    } catch (err) {
      throw new RepositoryError(
        "Failed to create email send recipients",
        "createEmailSendRecipients",
        err
      );
    }
  }

  async recordEmailEvent(data: NewEmailEvent): Promise<void> {
    try {
      await this.db.insert(emailEvents).values(data);
    } catch (err) {
      throw new RepositoryError(
        "Failed to record email event",
        "recordEmailEvent",
        err
      );
    }
  }
}
