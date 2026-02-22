/**
 * apps/api/src/services/newsletter.service.ts
 */

import crypto from "node:crypto";
import type {
  INewsletterRepository,
  IMemberRepository,
} from "@cms/core/types/repositories";
import type { IEmailProvider } from "@cms/core/types/providers";
import type { Newsletter, EmailSend } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import {
  NotFoundError,
  ConflictError,
  UnprocessableError,
} from "@cms/core/errors";

export class NewsletterService {
  constructor(
    private readonly newsletterRepo: INewsletterRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly emailProvider: IEmailProvider
  ) {}

  async getById(siteId: string, id: string): Promise<Newsletter> {
    const newsletter = await this.newsletterRepo.findById(siteId, id);
    if (!newsletter) throw new NotFoundError("Newsletter", id);
    return newsletter;
  }

  async getDefault(siteId: string): Promise<Newsletter | null> {
    return this.newsletterRepo.findDefault(siteId);
  }

  async listNewsletters(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Newsletter>> {
    return this.newsletterRepo.findMany(siteId, pagination);
  }

  async createNewsletter(
    siteId: string,
    input: {
      name: string;
      description?: string;
      senderName: string;
      senderEmail: string;
      replyToEmail?: string;
    }
  ): Promise<Newsletter> {
    const isFirst =
      (await this.newsletterRepo.findMany(siteId, { page: 1, limit: 1 })).meta
        .total === 0;

    return this.newsletterRepo.create({
      id: crypto.randomUUID(),
      site_id: siteId,
      name: input.name,
      description: input.description ?? null,
      sender_name: input.senderName,
      sender_email: input.senderEmail,
      reply_to_email: input.replyToEmail ?? input.senderEmail,
      status: "active",
      is_default: isFirst,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async updateNewsletter(
    siteId: string,
    id: string,
    input: Partial<{
      name: string;
      description: string | null;
      senderName: string;
      senderEmail: string;
      replyToEmail: string;
    }>
  ): Promise<Newsletter> {
    const newsletter = await this.newsletterRepo.findById(siteId, id);
    if (!newsletter) throw new NotFoundError("Newsletter", id);

    return this.newsletterRepo.update(siteId, id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.senderName !== undefined && { sender_name: input.senderName }),
      ...(input.senderEmail !== undefined && {
        sender_email: input.senderEmail,
      }),
      ...(input.replyToEmail !== undefined && {
        reply_to_email: input.replyToEmail,
      }),
    });
  }

  async subscribeEmail(
    siteId: string,
    newsletterId: string,
    memberId: string
  ): Promise<void> {
    await this.newsletterRepo.subscribeMember({
      id: crypto.randomUUID(),
      site_id: siteId,
      member_id: memberId,
      newsletter_id: newsletterId,
      subscribed: true,
      created_at: new Date(),
    });
  }

  async unsubscribeEmail(
    siteId: string,
    newsletterId: string,
    memberId: string
  ): Promise<void> {
    await this.newsletterRepo.unsubscribeMember(siteId, memberId, newsletterId);
  }

  async sendTestEmail(
    siteId: string,
    newsletterId: string,
    toEmail: string,
    subject: string,
    html: string
  ): Promise<void> {
    const newsletter = await this.newsletterRepo.findById(siteId, newsletterId);
    if (!newsletter) throw new NotFoundError("Newsletter", newsletterId);

    await this.emailProvider.send({
      from: `${newsletter.sender_name} <${newsletter.sender_email}>`,
      to: toEmail,
      subject: `[TEST] ${subject}`,
      html,
    });
  }
}
