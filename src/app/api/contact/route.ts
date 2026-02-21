import { db } from "@/src/db";
import { contactMessages } from "@/src/db/schemas/contact.sql";
import { getClientIp, rateLimit } from "@/src/lib/rate-limit";
import { sanitizeAndEncodeHtml } from "@/src/utils";
import { NextRequest, NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;

export async function POST(request: NextRequest) {
  // Rate limit: 3 contact submissions per IP per 15 minutes
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, { limit: 3, windowSecs: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be between 1 and ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (typeof message !== "string" || message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    await db.insert(contactMessages).values({
      name: sanitizeAndEncodeHtml(name.trim()),
      email,
      message: sanitizeAndEncodeHtml(message),
    });

    return NextResponse.json({
      message: "Message sent successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
