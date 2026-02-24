/**
 * apps/api/src/providers/payment/index.ts
 *
 * Resolves the configured payment provider.
 * Called ONCE in container.ts.
 */

import type { IPaymentProvider } from "@cms/core/types/providers";
import { ConfigurationError } from "@cms/core/errors";
import { StripePaymentAdapter } from "./stripe.adapter";

export function resolvePaymentProvider(): IPaymentProvider | null {
  const provider = process.env.PAYMENT_PROVIDER ?? "stripe";

  if (provider === "stripe") {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) return null;

    return new StripePaymentAdapter(secretKey, webhookSecret);
  }

  throw new ConfigurationError(
    `Unknown PAYMENT_PROVIDER: ${provider}. Supported: stripe`
  );
}
