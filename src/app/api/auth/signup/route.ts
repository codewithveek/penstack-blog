import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { signupSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimit(req, 5, 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    const validatedData = signupSchema.parse(body);
    const { name, email, password } = validatedData;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
      columns: { id: true, email: true },
    });

    if (existingUser) {
      logger.warn("Signup attempt with existing email", { email });
      return NextResponse.json(
        { data: null, message: "User already exists" },
        { status: 400 }
      );
    }

    // Use better-auth's internal API to create user + account properly
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    logger.info("User created successfully via better-auth", { email });

    return NextResponse.json({
      data: result.user,
      message: "User created successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Signup validation failed", { errors: error.issues });
      return NextResponse.json(
        {
          data: null,
          message: "Validation failed",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error("Error creating user", error);
    return NextResponse.json(
      { data: null, message: "Error creating user" },
      { status: 500 }
    );
  }
}
