import { db } from "@/db";
import { verificationTokens, users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { VerificationEmail } from "@/components//Emails/Verification";
import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/send-email";
import { getSettings } from "@/lib/queries/settings";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        message: "Email is required",
      },
      { status: 400 }
    );
  }
  const siteSettings = await getSettings();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user)
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 }
    );
  //   if (user?.email_verified)
  //     return NextResponse.json(
  //       {
  //         success: false,
  //         message: "Email already verified",
  //       },
  //       { status: 400 }
  //     );

  const token = crypto.randomBytes(32).toString("hex");
  const expires = addMinutes(new Date(), 15); // 15 minutes

  await db.insert(verificationTokens).values({
    user_id: user?.auth_id as string,
    token,
    expires,
  });

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const verificationLink = `${appUrl}/verify-email?token=${token}`;

  await sendEmail({
    from: `${siteSettings?.siteName.value}: Account verification <${siteSettings?.emailFrom.value}>`,
    to: user?.email as string,
    subject: "Verify your email address",
    react: VerificationEmail({ verificationLink }),
  });

  return NextResponse.json({ success: true });
}
