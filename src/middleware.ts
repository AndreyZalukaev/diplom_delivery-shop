import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPaths = ["/user-profile", "/administrator", "/cart", "/favorites"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    try {
      const sessionCookie = request.cookies.get("user");
      
      if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Проверяем роль для страниц добавления/редактирования товаров
      const productManagePaths = ["/administrator/products/add-product"];
      const isProductManagePath = productManagePaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      );

      if (isProductManagePath) {
        try {
          const userData = JSON.parse(decodeURIComponent(sessionCookie.value));
          const role = userData?.role;
          
          // Только admin и manager
          if (role !== "admin" && role !== "manager") {
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
  matcher: ["/user-profile/:path*", "/administrator/:path*", "/cart/:path*", "/favorites/:path*"],
};
