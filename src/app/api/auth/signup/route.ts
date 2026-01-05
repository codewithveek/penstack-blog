import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/queries/create-user";
import { getUser } from "@/lib/queries/get-user";
import { signupSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimit(req, 5, 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    const validatedData = signupSchema.parse(body);
    const { name, email, password } = validatedData;

    const username = email.split("@")[0];
    const existingUser = await getUser(email);

    if (existingUser) {
      logger.warn("Signup attempt with existing email", { email });
      return NextResponse.json(
        { data: null, message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await createUser({ name, email, password, username });
    logger.info("User created successfully", { userId: user?.id, email });

    return NextResponse.json({
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Signup validation failed", { errors: error.issues });
      return NextResponse.json(
        {
          data: null,
          message: "Validation failed",
          errors: error.issues
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
