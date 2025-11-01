import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schemas/newsletter.sql";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: and(eq(newsletterSubscribers.verification_token, token)),
  });

  if (!subscriber || new Date() > subscriber.verification_token_expires!) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  await db
    .update(newsletterSubscribers)
    .set({
      verification_status: "verified",
      verification_token: null,
      verification_token_expires: null,
    })
    .where(eq(newsletterSubscribers.id, subscriber.id));

  return NextResponse.json({
    message: "Your subscription has been confirmed",
  });
}
