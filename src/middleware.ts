import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SITE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NETLIFY && process.env.URL) ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : "http://localhost:3025";

function applySecurityHeaders(response: NextResponse, pathname: string) {
  // Security headers for all routes
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGIN || SITE_URL || "*"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,DELETE,PATCH,POST,PUT"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/setup") || pathname.startsWith("/api/setup")) {
    return applySecurityHeaders(NextResponse.next(), pathname);
  }

  // try {
  //   const setupStatusResponse = await fetch(
  //     new URL("/api/setup/status", request.url),
  //     {
  //       headers: request.headers,
  //     }
  //   );

  //   if (setupStatusResponse.ok) {
  //     const { data } = await setupStatusResponse.json();

  //     if (data.requiresSetup) {
  //       return NextResponse.redirect(new URL("/setup", request.url));
  //     }
  //   }
  // } catch (error) {
  //   console.error("Setup status check failed:", error);
  // }

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

  return applySecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
