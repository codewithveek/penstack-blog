/**
 * apps/api/src/providers/email/smtp.adapter.ts
 *
 * Nodemailer SMTP email provider adapter.
 * The ONLY file that imports nodemailer.
 */

import nodemailer from "nodemailer";
import type {
  IEmailProvider,
  EmailMessage,
  BatchEmailMessage,
} from "@cms/core/types/providers";
import { ProviderError, ConfigurationError } from "@cms/core/errors";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export class SmtpEmailAdapter implements IEmailProvider {
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

  async send(message: EmailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: message.from,
        to: Array.isArray(message.to) ? message.to.join(",") : message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
      });
    } catch (err) {
      throw new ProviderError("smtp", `Failed to send email: ${String(err)}`);
    }
  }

  async sendBatch(messages: BatchEmailMessage[]): Promise<void> {
    // SMTP does not have native batch — send sequentially
    const results = await Promise.allSettled(messages.map((m) => this.send(m)));
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      throw new ProviderError(
        "smtp",
        `Batch send failed for ${failed.length} of ${messages.length} messages`
      );
    }
  }
}
