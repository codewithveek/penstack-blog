import { db } from "@/src/db";
import { verificationTokens, users } from "@/src/db/schemas";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { VerificationEmail } from "@/src/app/components/Emails/Verification";
import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sendEmail } from "@/src/lib/send-email";
import { getSettings } from "@/src/lib/queries/settings";
import { getClientIp, rateLimit } from "@/src/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 3 verification emails per IP per 10 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(`send-verification:${ip}`, { limit: 3, windowSecs: 600 });
  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please try again later.",
      },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

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
