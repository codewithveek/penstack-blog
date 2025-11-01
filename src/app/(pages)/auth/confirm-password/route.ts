import { NextResponse } from "next/server";

import { db } from "@/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/next-auth";
import { eq } from "drizzle-orm";
import { users } from "@/db/schemas";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { password } = body;

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password is required", data: null },

        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", data: null },
        { status: 404 }
      );
    }

    const passwordsMatch = await bcrypt.compare(password, user.password!);

    if (!passwordsMatch) {
      return NextResponse.json(
        { message: "Invalid password", data: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Password verified",
      data: { isValid: true },
    });
  } catch (error) {
    console.error("ERROR_CONFIRM_PASSWORD", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
