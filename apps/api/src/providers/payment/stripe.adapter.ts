/**
 * apps/api/src/providers/payment/stripe.adapter.ts
 *
 * Stripe payment provider adapter.
 * The ONLY file that imports the Stripe SDK.
 */

import Stripe from "stripe";
import type {
  IPaymentProvider,
  CreateCheckoutOptions,
  CheckoutSession,
  PortalSession,
  SubscriptionWebhookPayload,
  CreatePortalSessionOptions,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export class StripePaymentAdapter implements IPaymentProvider {
  readonly name = "stripe";
  private readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string
  ) {
    this.stripe = new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });
  }

  async createCheckoutSession(
    options: CreateCheckoutOptions
  ): Promise<CheckoutSession> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer_email: options.memberEmail,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: options.priceId, quantity: 1 }],
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        ...(options.trialDays !== undefined && {
          subscription_data: { trial_period_days: options.trialDays },
        }),
      });

      return {
        id: session.id,
        url: session.url ?? "",
      };
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Failed to create checkout session: ${String(err)}`
      );
    }
  }

  async createPortalSession(
    options: CreatePortalSessionOptions
  ): Promise<PortalSession> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: options.customerId,
        return_url: options.returnUrl,
      });
      return { url: session.url };
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Failed to create portal session: ${String(err)}`
      );
    }
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(providerSubscriptionId);
    } catch (err) {
      throw new ProviderError(
        "stripe",
        `Failed to cancel subscription: ${String(err)}`
      );
    }
  }

  async parseWebhookPayload(
    rawBody: string,
    signature: string,
    _secret: string
  ): Promise<SubscriptionWebhookPayload> {
    let event: Stripe.Event;
    try {
      // Use stored webhook secret (passed once at construction; _secret is ignored)
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

  private normalizeEvent(event: Stripe.Event): SubscriptionWebhookPayload {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "subscription.created",
          providerCustomerId: (session.customer as string) ?? "",
          providerSubscriptionId: (session.subscription as string) ?? "",
          status: "active",
          raw: event,
        };
      }
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const subData = sub as unknown as {
          current_period_start: number;
          current_period_end: number;
        };
        return {
          type: "subscription.created",
          providerCustomerId: sub.customer as string,
          providerSubscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: new Date(subData.current_period_start * 1000),
          currentPeriodEnd: new Date(subData.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          raw: event,
        };
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const subData = sub as unknown as {
          current_period_start: number;
          current_period_end: number;
        };
        return {
          type: "subscription.updated",
          providerCustomerId: sub.customer as string,
          providerSubscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: new Date(subData.current_period_start * 1000),
          currentPeriodEnd: new Date(subData.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          raw: event,
        };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          type: "subscription.deleted",
          providerCustomerId: sub.customer as string,
          providerSubscriptionId: sub.id,
          status: sub.status,
          raw: event,
        };
      }
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const subRef = inv.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subRef === "string" ? subRef : (subRef?.id ?? "");
        return {
          type: "payment.succeeded",
          providerCustomerId: (inv.customer as string) ?? "",
          providerSubscriptionId: subscriptionId,
          status: "paid",
          raw: event,
        };
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subRef = inv.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subRef === "string" ? subRef : (subRef?.id ?? "");
        return {
          type: "payment.failed",
          providerCustomerId: (inv.customer as string) ?? "",
          providerSubscriptionId: subscriptionId,
          status: "payment_failed",
          raw: event,
        };
      }
      default:
        // For unknown events return a neutral "updated" shape
        return {
          type: "subscription.updated",
          providerCustomerId: "",
          providerSubscriptionId: "",
          status: "unknown",
          raw: event,
        };
    }
  }
}
