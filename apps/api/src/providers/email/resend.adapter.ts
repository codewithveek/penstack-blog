/**
 * apps/api/src/providers/email/resend.adapter.ts
 *
 * Resend email provider adapter.
 * The ONLY file that imports the Resend SDK.
 */

import { Resend } from "resend";
import type {
  IEmailProvider,
  EmailMessage,
  BatchEmailMessage,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export class ResendEmailAdapter implements IEmailProvider {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.client.emails.send({
      from: message.from,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo,
      tags: message.tags?.map((t) => ({ name: t.name, value: t.value })),
    });

    if (error) {
      throw new ProviderError(
        "resend",
        `Failed to send email: ${error.message}`
      );
    }
  }

  async sendBatch(messages: BatchEmailMessage[]): Promise<void> {
    const { error } = await this.client.batch.send(
      messages.map((m) => ({
        from: m.from,
        to: Array.isArray(m.to) ? m.to : [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        reply_to: m.replyTo,
      }))
    );

    if (error) {
      throw new ProviderError(
        "resend",
        `Failed to send batch emails: ${error.message}`
      );
    }
  }
}
