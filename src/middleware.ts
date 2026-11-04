import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TOKEN_COOKIE = "wherio_admin_token";
const PUBLIC_PATHS = ["/login", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, Next.js internals, and favicon/icon routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Protect dashboard routes: redirect unauthenticated visitors to /login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting /login or /sign-up, redirect to dashboard
  if (token && isPublicPath) {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
