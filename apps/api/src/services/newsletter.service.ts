/**
 * apps/api/src/services/newsletter.service.ts
 */

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
    private readonly emailProvider: IEmailProvider | null
  ) {}

  async getById(siteId: string, id: string): Promise<Newsletter> {
    const newsletter = await this.newsletterRepo.findById(siteId, id);
    if (!newsletter) throw new NotFoundError("Newsletter", id);
    return newsletter;
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

    const slug = input.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 100);

    return this.newsletterRepo.create({
      site_id: siteId,
      name: input.name,
      slug,
      description: input.description ?? null,
      sender_name: input.senderName ?? null,
      sender_email: input.senderEmail ?? null,
      reply_to_email: input.replyToEmail ?? input.senderEmail ?? null,
      active: true,
      subscribe_on_signup: isFirst,
      header_html: null,
      footer_html: null,
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
    await this.memberRepo.upsertMemberNewsletterSubscription(
      memberId,
      newsletterId,
      true
    );
  }

  async unsubscribeEmail(
    siteId: string,
    newsletterId: string,
    memberId: string
  ): Promise<void> {
    await this.memberRepo.upsertMemberNewsletterSubscription(
      memberId,
      newsletterId,
      false
    );
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

    if (!this.emailProvider) {
      throw new UnprocessableError("Email provider is not configured");
    }

    await this.emailProvider.send({
      from: {
        email: newsletter.sender_email ?? `noreply@cms`,
        name: newsletter.sender_name ?? newsletter.name,
      },
      to: { email: toEmail },
      subject: `[TEST] ${subject}`,
      html,
    });
  }

  async deleteNewsletter(siteId: string, id: string): Promise<void> {
    const newsletter = await this.newsletterRepo.findById(siteId, id);
    if (!newsletter) throw new NotFoundError("Newsletter", id);
    await this.newsletterRepo.delete(siteId, id);
  }
}
