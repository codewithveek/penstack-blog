import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { parseUserAgent } from "@/utils/user-agent-parser";
import { trackPostView } from "@/utils/views-tracking";
import { getGeoLocation } from "@/utils/geo-ip";
import { getSession } from "@/lib/auth/next-auth";
import { getOrCreateSessionId } from "@/utils/views-tracking/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    const body = await req.json();
    const { post_id, time_spent } = body;
    const cookieStore = cookies();
    const referrer = req.headers.get("referer") || "";

    // Get or create session ID
    const { sessionId, isNewSession } = await getOrCreateSessionId(
      cookieStore,
      referrer
    );
    // Get IP address
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Get user agent and parse it
    const userAgent = req.headers.get("user-agent") || "";
    const deviceInfo = parseUserAgent(userAgent);
    const location = await getGeoLocation(ip);

    // Get referrer

    // Track the view
    await trackPostView({
      postId: post_id,
      userId,
      ipAddress: ip,
      userAgent,
      referrer,
      sessionId,
      timeSpent: time_spent,
      deviceInfo: {
        type: deviceInfo.device.type,
        browser: deviceInfo.browser.name,
        os: deviceInfo.os.name,
      },
      location: {
        country: location.country,
        region: location.region,
        city: location.city,
      },
    });

    const response = NextResponse.json({ success: true });

    // Set session cookie if it's new
    if (isNewSession) {
      response.cookies.set("viewSessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
