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
      text: options.text,
      replyTo: options.replyTo ? formatAddress(options.replyTo) : undefined,
      tags: options.tags
        ? Object.entries(options.tags).map(([name, value]) => ({ name, value }))
        : undefined,
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
    const { data, error } = await this.client.batch.send(
      messages.map((m) => {
        const toAddresses = Array.isArray(m.to) ? m.to : [m.to];
        return {
          from: formatAddress(m.from),
          to: toAddresses.map(formatAddress),
          subject: m.subject,
          html: m.html,
          text: m.text,
          replyTo: m.replyTo ? formatAddress(m.replyTo) : undefined,
        };
      })
    );

    if (error) {
      throw new ProviderError(
        "resend",
        `Failed to send batch emails: ${error.message}`
      );
    }

    return (data ?? []).map((d) => ({ messageId: d.id ?? "" }));
  }
}
