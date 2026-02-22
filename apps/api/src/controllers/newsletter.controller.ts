/**
 * apps/api/src/controllers/newsletter.controller.ts
 */

import type { NewsletterService } from "../services/newsletter.service";
import type { Newsletter } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";

export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  async list(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Newsletter>> {
    return this.newsletterService.listNewsletters(siteId, pagination);
  }

  async getById(siteId: string, id: string): Promise<Newsletter> {
    return this.newsletterService.getById(siteId, id);
  }

  async create(
    siteId: string,
    input: {
      name: string;
      description?: string;
      senderName: string;
      senderEmail: string;
      replyToEmail?: string;
    }
  ): Promise<Newsletter> {
    return this.newsletterService.createNewsletter(siteId, input);
  }

  async update(
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
    return this.newsletterService.updateNewsletter(siteId, id, input);
  }

  async subscribe(
    siteId: string,
    newsletterId: string,
    memberId: string
  ): Promise<void> {
    return this.newsletterService.subscribeEmail(
      siteId,
      newsletterId,
      memberId
    );
  }

  async unsubscribe(
    siteId: string,
    newsletterId: string,
    memberId: string
  ): Promise<void> {
    return this.newsletterService.unsubscribeEmail(
      siteId,
      newsletterId,
      memberId
    );
  }

  async sendTest(
    siteId: string,
    newsletterId: string,
    toEmail: string,
    subject: string,
    html: string
  ): Promise<void> {
    return this.newsletterService.sendTestEmail(
      siteId,
      newsletterId,
      toEmail,
      subject,
      html
    );
  }
}
