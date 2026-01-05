import { logger } from "@/lib/logger";
import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { WebhookRequiredHeaders } from "svix";
import { db } from "@/db";
import { emailEvents, newsletterSubscribers, newsletters } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { ResendWebhookEvent } from "@/types";
import { IncomingMessage } from "http";

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyWebhookSignature(req);

    // Find associated newsletter and subscriber
    const [newsletter] = await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.resend_email_id, payload.data.email_id))
      .limit(1);

    const [subscriber] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, payload.data.to))
      .limit(1);

    const eventType = payload.type.split(".")[1] as
      | "sent"
      | "clicked"
      | "opened"
      | "complained"
      | "bounced";
    await db.insert(emailEvents).values({
      email_id: payload.data.email_id,
      newsletter_id: newsletter?.id,
      subscriber_id: subscriber?.id,
      event_type: eventType,
      event_data: payload.data,
    });

    // Handle specific events
    switch (payload.type) {
      case "email.bounced":
      case "email.complained":
        if (subscriber) {
          await db
            .update(newsletterSubscribers)
            .set({
              status: "unsubscribed",
              unsubscribed_at: new Date(),
            })
            .where(eq(newsletterSubscribers.id, subscriber.id));
        }
        break;
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    logger.error("Webhook error:", error);
    return new NextResponse("Internal error", { status: 400 });
  }
}

async function verifyWebhookSignature(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) throw new Error("RESEND_WEBHOOK_SECRET is not set");

  const payload = await req.text();
  const reqHeaders = headers() as unknown as IncomingMessage["headers"] &
    WebhookRequiredHeaders;

  const webhook = new Webhook(secret);
  const event = webhook.verify(payload, reqHeaders) as ResendWebhookEvent;

  if (!event) {
    throw new Error("Invalid webhook payload");
  }

  logger.debug("Webhook verified", { type: event.type });

  return event;
}
