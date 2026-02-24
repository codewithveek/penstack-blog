import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

const ADMIN_PATHS = ["/admin", "/setup"];

async function resolveSiteFromHost(host: string): Promise<string | null> {
  const apiBase = process.env.API_INTERNAL_URL ?? "http://localhost:3100";
  try {
    const res = await fetch(
      `${apiBase}/api/internal/sites/resolve?host=${encodeURIComponent(host)}`,
      {
        cache: "no-store",
        headers: { "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "" },
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data: { id: string } };
    return json.data.id;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip static assets and API proxy
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0] ?? "";

  // Resolve site
  const siteId = await resolveSiteFromHost(hostname);

  if (!siteId) {
    // No site found — only allow setup path
    if (!pathname.startsWith("/setup")) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-id", siteId);
  requestHeaders.set("x-site-host", hostname);

  // Guard admin routes: ensure admin session cookie exists
  // Better Auth uses the prefix "cms_admin" → cookie name is "cms_admin.session_token"
  if (
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) &&
    pathname !== "/setup"
  ) {
    const adminSession =
      request.cookies.get("cms_admin.session_token") ??
      request.cookies.get("cms_admin.session_token.0") ??
      request.cookies.get("admin_session");
    if (!adminSession && !pathname.startsWith("/admin/login")) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
