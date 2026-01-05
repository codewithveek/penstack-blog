import { db } from "@/db";
import { contactMessages } from "@/db/schemas/contact.sql";
import { sanitizeAndEncodeHtml } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, 3, 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);
    const { name, email, message } = validated;

    await db.insert(contactMessages).values({
      name,
      email,
      message: sanitizeAndEncodeHtml(message),
    });

    logger.info("Contact message received", { email });

    return NextResponse.json({
      message: "Message sent successfully",
      data: {},
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Contact form validation failed", { errors: error.issues });
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error("Error saving contact message", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
