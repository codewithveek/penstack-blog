import { db } from "@/db";
import { postViewAnalytics } from "@/db/schemas";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import {
  ResponseCookies,
  RequestCookies,
} from "next/dist/server/web/spec-extension/cookies";

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

export async function getOrCreateSessionId(
  cookieStore: RequestCookies | ResponseCookies,

  referrer: string
): Promise<{ sessionId: string; isNewSession: boolean }> {
  const existingSessionId = cookieStore.get("viewSessionId");

  if (existingSessionId) {
    return {
      sessionId: existingSessionId.value,
      isNewSession: false,
    };
  }

  const sessionId = generateSessionId();

  // Record entry point for new session
  await recordEntryPoint(sessionId, referrer);

  return {
    sessionId,
    isNewSession: true,
  };
}

async function recordEntryPoint(sessionId: string, referrer: string) {
  await db
    .update(postViewAnalytics)
    .set({
      entry_point: referrer,
    })
    .where(eq(postViewAnalytics.session_id, sessionId));
}
