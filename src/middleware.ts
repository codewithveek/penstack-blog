import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/setup") || pathname.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  try {
    const setupStatusResponse = await fetch(
      new URL("/api/setup/status", request.url),
      {
        headers: request.headers,
      }
    );

    if (setupStatusResponse.ok) {
      const { data } = await setupStatusResponse.json();

      if (data.requiresSetup) {
        return NextResponse.redirect(new URL("/setup", request.url));
      }
    }
  } catch (error) {
    console.error("Setup status check failed:", error);
  }

  if (pathname.startsWith("/dashboard")) {
    // Check for better-auth session cookie
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Session validation happens server-side in the dashboard layout
    // The middleware just checks for cookie presence for a fast redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
