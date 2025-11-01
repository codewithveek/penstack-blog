import { db } from "@/db";
import { users, verificationTokens } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const verificationToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ email_verified: true })
      .where(eq(users.auth_id, verificationToken.user_id));

    await tx
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, verificationToken.id));
  });

  return NextResponse.json({ success: true });
}
