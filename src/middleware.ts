import { withAuth } from "next-auth/middleware";
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
    return (withAuth as any)(request, {
      callbacks: {
        authorized: ({ token }: any) => {
          if (!token) return false;
          return token.permissions.includes("dashboard:access");
        },
      },
      pages: {
        signIn: "/auth/signin",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
