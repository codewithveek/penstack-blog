/**
 * apps/api/src/providers/email/smtp.adapter.ts
 *
 * Nodemailer SMTP email provider adapter.
 * The ONLY file that imports nodemailer.
 */

import nodemailer from "nodemailer";
import type {
  IEmailProvider,
  SendEmailOptions,
  SendEmailResult,
  EmailAddress,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

function toNodemailerAddress(
  addr: EmailAddress
): { name: string; address: string } {
  return { name: addr.name ?? "", address: addr.email };
}

export class SmtpEmailAdapter implements IEmailProvider {
  readonly name = "smtp";
  private readonly transporter: nodemailer.Transporter;

  constructor(config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    try {
      const info = await this.transporter.sendMail({
        from: toNodemailerAddress(options.from),
        to: toAddresses.map(toNodemailerAddress),
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo
          ? toNodemailerAddress(options.replyTo)
          : undefined,
      });
      return { messageId: info.messageId };
    } catch (err) {
      throw new ProviderError("smtp", `Failed to send email: ${String(err)}`);
    }
  }

  async sendBatch(messages: SendEmailOptions[]): Promise<SendEmailResult[]> {
    // SMTP does not have native batch — send sequentially
    const results: SendEmailResult[] = [];
    const errors: unknown[] = [];
    for (const m of messages) {
      try {
        results.push(await this.send(m));
      } catch (err) {
        errors.push(err);
      }
    }
    if (errors.length > 0) {
      throw new ProviderError(
        "smtp",
        `Batch send failed for ${errors.length} of ${messages.length} messages`
      );
    }
    return results;
  }
}
