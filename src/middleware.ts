import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenValid } from "./lib/token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/auth/login";

  if (token && isAuthPage) {
    const previousPage = req.headers.get("referer") || "/dashboard";
    const redirectUrl = new URL(previousPage, req.url);

    if (redirectUrl.pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.redirect(redirectUrl);
  }

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (!token || !isTokenValid(token, "token")) {
    console.log("Redirecting to login, invalid token:", token);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/inactive", "/members", "/membership", "/"],
};
