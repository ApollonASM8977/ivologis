import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LANG, LANG_COOKIE, isLang } from "@/lib/i18n";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN_AGENT: "/admin/dashboard",
  OWNER: "/owner/dashboard",
  TENANT: "/tenant/dashboard",
};

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Contrôle d'accès des espaces : renvoie une redirection, ou null si la page peut être servie. */
function accessRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ivologis_token")?.value;
  const role = request.cookies.get("ivologis_role")?.value ?? "";
  const home = ROLE_HOME[role];
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  // U-16 : l'accueil reste consultable une fois connecté (« Mon espace » dans l'en-tête) ; seules les pages de connexion renvoient vers l'espace.
  if (matches(pathname, AUTH_PATHS)) return token && home ? to(home) : null;

  const space = pathname.match(/^\/(admin|owner|tenant)(\/|$)/)?.[1];
  if (!space) return null;
  if (!token) return to("/login");
  if (!home) return null;
  if (space === "admin" && role !== "SUPER_ADMIN" && role !== "ADMIN_AGENT") return to(home);
  if (space === "owner" && role !== "OWNER") return to(home);
  if (space === "tenant" && role !== "TENANT") return to(home);
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Lien explicite /en/… ou ?lang=en : on mémorise la langue puis on revient à l'adresse habituelle.
  const prefix = pathname.split("/")[1];
  const queryLang = request.nextUrl.searchParams.get("lang");
  if (isLang(prefix) || isLang(queryLang)) {
    const url = request.nextUrl.clone();
    if (isLang(prefix)) url.pathname = pathname.slice(prefix.length + 1) || "/";
    url.searchParams.delete("lang");
    const res = NextResponse.redirect(url);
    // `secure` dès que le site est servi en https (Render transmet le protocole d'origine dans x-forwarded-proto) (S-22).
    const https = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")) === "https";
    res.cookies.set(LANG_COOKIE, isLang(prefix) ? prefix : (queryLang as string), { path: "/", maxAge: 31536000, sameSite: "lax", secure: https });
    return res;
  }

  const redirect = accessRedirect(request);
  if (redirect) return redirect;

  const cookieLang = request.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;
  return NextResponse.rewrite(new URL(`/${lang}${pathname === "/" ? "" : pathname}${search}`, request.url));
}

export const config = {
  // Toutes les pages ; pas les fichiers (logos, sw.js…), ni les routes générées (icônes, manifeste, robots, plan du site).
  matcher: ["/((?!_next/|api/|icon|apple-icon|opengraph-image|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)"],
};
