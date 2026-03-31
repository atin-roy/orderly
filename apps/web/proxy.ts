import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TOKEN_COOKIE = "orderly_token";
const ROLE_COOKIE = "orderly_role";

function loginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;
  const isCustomerRoute =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout");

  if (pathname.startsWith("/profile")) {
    if (!token) {
      return loginRedirect(request);
    }

    return NextResponse.next();
  }

  if (isCustomerRoute) {
    if (!token) {
      return loginRedirect(request);
    }

    if (role !== "USER") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/cart/:path*", "/checkout/:path*"],
};
