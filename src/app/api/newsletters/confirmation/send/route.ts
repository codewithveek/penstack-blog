import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { NewsletterConfirmationTemplate } from "@/components//Emails/Newsletter/Confirmation";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schemas/newsletter.sql";
import { addHours } from "date-fns";
import crypto from "crypto";
import { sendEmail } from "@/lib/send-email";
import { getSettings } from "@/lib/queries/settings";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = addHours(new Date(), 24);
    if (!email) {
      return NextResponse.json({
        error: "email is required",
      });
    }
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const confirmationUrl = `${appUrl}/newsletter/confirm?token=${verificationToken}`;

    if (!appUrl) {
      return NextResponse.json(
        {
          error: "NEXT_PUBLIC_SITE_URL is required",
        },
        { status: 400 }
      );
    }
    const existingEmail = await db.query.newsletterSubscribers.findFirst({
      where: eq(
        sql`lower(${newsletterSubscribers.email})`,
        email.toLowerCase()
      ),
    });
    if (existingEmail) {
      await db
        .update(newsletterSubscribers)
        .set({
          verification_token: verificationToken,
          verification_token_expires: tokenExpiry,
        })
        .where(eq(newsletterSubscribers.email, email));
    } else {
      await db.insert(newsletterSubscribers).values({
        email,
        name,
        verification_token: verificationToken,
        verification_token_expires: tokenExpiry,
      });
    }

    const siteSettings = await getSettings();
    await sendEmail({
      from: `${siteSettings?.siteName?.value} Newsletter <${siteSettings?.newsletterEmailFrom?.value || siteSettings?.emailFrom?.value}>`,
      to: email,
      subject: "Confirm your newsletter subscription",
      react: NewsletterConfirmationTemplate({
        confirmationUrl,
        recipientEmail: email,
      }),
    });

    return NextResponse.json({
      message: "Please check your email to confirm subscription",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Error sending email",
      },
      { status: 500 }
    );
  }
}
