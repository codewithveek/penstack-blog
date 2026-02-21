import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/src/lib/queries/create-user";
import { getUser } from "@/src/lib/queries/get-user";
import { getClientIp, rateLimit } from "@/src/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

export async function POST(req: NextRequest) {
  // Rate limit: 5 signup attempts per IP per 10 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(`signup:${ip}`, { limit: 5, windowSecs: 600 });
  if (!rl.success) {
    return NextResponse.json(
      { data: null, message: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { data: null, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { data: null, message: `Name must be between 1 and ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { data: null, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { data: null, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const username = email.split("@")[0];
    const existingUser = await getUser(email);

    if (existingUser) {
      return NextResponse.json(
        { data: null, message: "User already exists" },
        { status: 400 }
      );
    }
    const user = await createUser({ name: name.trim(), email, password, username });
    return NextResponse.json({
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: "Error creating user" },
      { status: 500 }
    );
  }
}
