import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession } from "@/lib/demo-auth";

// Routes reachable without a staff session.
const PUBLIC_PATHS = ["/login", "/signup", "/developer"];
// Auth pages that a logged-in staff member should be redirected away from.
const AUTH_PAGES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Unauthenticated users hitting a protected route → login
  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users hitting login/signup → dashboard
  if (session && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything except Next internals, API auth, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)",
  ],
};
