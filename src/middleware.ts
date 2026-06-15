import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

/**
 * Locale routing: every page lives under /[locale]. Requests without a locale
 * prefix always open in the default locale (Arabic). Visitors can switch
 * language afterwards from the header.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("/brand/") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
