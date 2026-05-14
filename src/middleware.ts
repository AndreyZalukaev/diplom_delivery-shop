import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Middleware защиты роутов */
export function middleware(request: NextRequest) {
  const protectedPaths = ["/user-profile", "/administrator", "/cart", "/favorites", "/user-orders"];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    try {
      const sessionCookie = request.cookies.get("user");
      if (!sessionCookie) return NextResponse.redirect(new URL("/", request.url));

      const productManagePaths = ["/administrator/products/add-product"];
      const isProductManagePath = productManagePaths.some((path) => request.nextUrl.pathname.startsWith(path));

      if (isProductManagePath) {
        try {
          const userData = JSON.parse(decodeURIComponent(sessionCookie.value));
          if (userData?.role !== "admin" && userData?.role !== "manager") {
            return NextResponse.redirect(new URL("/administrator", request.url));
          }
        } catch {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/user-profile/:path*", "/administrator/:path*", "/cart/:path*", "/favorites/:path*", "/user-orders/:path*"],
};
