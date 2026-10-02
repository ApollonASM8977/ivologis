import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN_AGENT: "/admin/dashboard",
  OWNER: "/owner/dashboard",
  TENANT: "/tenant/dashboard",
};

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ivologis_token")?.value;
  const role = request.cookies.get("ivologis_role")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (pathname === "/") {
    const dest = token && role ? ROLE_HOME[role] ?? "/login" : "/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", request.url));
  }

  if (token && role) {
    if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN" && role !== "ADMIN_AGENT") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/login", request.url));
    }
    if (pathname.startsWith("/owner") && role !== "OWNER") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/login", request.url));
    }
    if (pathname.startsWith("/tenant") && role !== "TENANT") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/forgot-password", "/reset-password", "/admin/:path*", "/owner/:path*", "/tenant/:path*"],
};
