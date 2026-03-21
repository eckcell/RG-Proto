import { NextRequest, NextResponse } from "next/server";

const GATE_COOKIE = "rg-admin-gate";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward the pathname so server components (e.g. layout.tsx) can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-url", pathname);

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const gatePassword = process.env.ADMIN_GATE_PASSWORD;

  // If no gate password is configured, the gate is disabled — pass through
  if (!gatePassword) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Allow the gate page and gate API through (otherwise infinite redirect)
  if (
    pathname === "/admin/gate" ||
    pathname.startsWith("/api/admin/gate")
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Check for the gate cookie
  const gateCookie = request.cookies.get(GATE_COOKIE);
  if (gateCookie?.value === "granted") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // No valid cookie — redirect to the gate page
  const gateUrl = new URL("/admin/gate", request.url);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
