import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN_AGENT: "/admin/dashboard",
  OWNER: "/owner/dashboard",
  TENANT: "/tenant/dashboard",
};

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const MARKETING_PATHS = ["/securite", "/mentions-legales", "/confidentialite"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ivologis_token")?.value;
  const role = request.cookies.get("ivologis_role")?.value;
  const isLoggedIn = !!token && !!role;

  if (pathname === "/") {
    return isLoggedIn && ROLE_HOME[role ?? ""]
      ? NextResponse.redirect(new URL(ROLE_HOME[role ?? ""], request.url))
      : NextResponse.next();
  }

  if (matches(pathname, MARKETING_PATHS)) {
    return NextResponse.next();
  }

  const isAuthPage = matches(pathname, AUTH_PATHS);

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", request.url));
  }

  if (isLoggedIn) {
    if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN" && role !== "ADMIN_AGENT") {
      return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", request.url));
    }
    if (pathname.startsWith("/owner") && role !== "OWNER") {
      return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", request.url));
    }
    if (pathname.startsWith("/tenant") && role !== "TENANT") {
      return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/securite",
    "/mentions-legales",
    "/confidentialite",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/admin/:path*",
    "/owner/:path*",
    "/tenant/:path*",
  ],
};
