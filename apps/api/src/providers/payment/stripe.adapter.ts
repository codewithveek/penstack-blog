/**
 * apps/api/src/providers/payment/stripe.adapter.ts
 *
 * Stripe payment provider adapter.
 * The ONLY file that imports the Stripe SDK.
 */

import Stripe from "stripe";
import type {
  IPaymentProvider,
  CreateCheckoutSessionParams,
  CheckoutSession,
  PortalSession,
  NormalizedPaymentEvent,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export class StripePaymentAdapter implements IPaymentProvider {
  private readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string
  ) {
    this.stripe = new Stripe(secretKey, { apiVersion: "2024-11-20.acacia" });
  }

  async createCheckoutSession(
    params: CreateCheckoutSessionParams
  ): Promise<CheckoutSession> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.customerId ?? undefined,
        customer_email: params.customerEmail,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
        subscription_data: {
          metadata: params.metadata,
        },
      });

      return {
        id: session.id,
        url: session.url!,
        customerId: session.customer as string | null,
      };
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Failed to create checkout session: ${String(err)}`
      );
    }
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<PortalSession> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return { url: session.url };
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Failed to create portal session: ${String(err)}`
      );
    }
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Failed to cancel subscription: ${String(err)}`
      );
    }
  }

  async parseWebhookPayload(
    rawBody: string,
    signature: string
  ): Promise<NormalizedPaymentEvent> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Webhook signature verification failed: ${String(err)}`
      );
    }

    return this.normalizeEvent(event);
  }

  private normalizeEvent(event: Stripe.Event): NormalizedPaymentEvent {
    const base = { provider: "stripe" as const, rawEvent: event };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          ...base,
          type: "checkout.completed",
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          metadata: session.metadata ?? {},
        };
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          ...base,
          type: "subscription.updated",
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          status: sub.status,
          metadata: sub.metadata,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          ...base,
          type: "subscription.cancelled",
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          metadata: sub.metadata,
        };
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        return {
          ...base,
          type: "invoice.payment_failed",
          customerId: inv.customer as string,
          subscriptionId: inv.subscription as string,
          metadata: {},
        };
      }
      default:
        return { ...base, type: "unknown", metadata: {} };
    }
  }
}
