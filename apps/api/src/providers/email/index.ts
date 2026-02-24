/**
 * apps/api/src/providers/email/index.ts
 *
 * Resolves the configured email provider from environment variables.
 * Called ONCE in container.ts.
 */

import type { IEmailProvider } from "@cms/core/types/providers";
import { ConfigurationError } from "@cms/core/errors";
import { ResendEmailAdapter } from "./resend.adapter";
import { SmtpEmailAdapter } from "./smtp.adapter";

export function resolveEmailProvider(): IEmailProvider | null {
  const provider = process.env.EMAIL_PROVIDER ?? "resend";

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new ResendEmailAdapter(apiKey);
  }

  if (provider === "smtp") {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) return null;

    return new SmtpEmailAdapter({
      host,
      port: parseInt(port, 10),
      secure: process.env.SMTP_SECURE === "true",
      user,
      pass,
    });
  }

  throw new ConfigurationError(
    `Unknown EMAIL_PROVIDER: ${provider}. Supported: resend, smtp`
  );
}
