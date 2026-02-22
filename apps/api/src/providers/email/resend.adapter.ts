/**
 * apps/api/src/providers/email/resend.adapter.ts
 *
 * Resend email provider adapter.
 * The ONLY file that imports the Resend SDK.
 */

import { Resend } from "resend";
import type {
  IEmailProvider,
  SendEmailOptions,
  SendEmailResult,
  EmailAddress,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

function formatAddress(addr: EmailAddress): string {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

export class ResendEmailAdapter implements IEmailProvider {
  readonly name = "resend";
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    const { data, error } = await this.client.emails.send({
      from: formatAddress(options.from),
      to: toAddresses.map(formatAddress),
      subject: options.subject,
      html: options.html,
      ...(options.text !== undefined && { text: options.text }),
      ...(options.replyTo !== undefined && { replyTo: formatAddress(options.replyTo) }),
      ...(options.tags !== undefined && {
        tags: Object.entries(options.tags).map(([name, value]) => ({ name, value })),
      }),
    });

    if (error) {
      throw new ProviderError(
        "resend",
        `Failed to send email: ${error.message}`
      );
    }

    return { messageId: data?.id ?? "" };
  }

  async sendBatch(messages: SendEmailOptions[]): Promise<SendEmailResult[]> {
    // Send sequentially to avoid rate limits; Resend batch API changes in v4 make
    // sequential sending the safest approach.
    return Promise.all(messages.map((m) => this.send(m)));
  }
}
