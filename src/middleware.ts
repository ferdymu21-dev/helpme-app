import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = [
  "/home",
  "/tasks",
  "/messages",
  "/profile",
];

const authRoutes = [
  "/login",
  "/register",
];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const accessToken =
    request.cookies.get("sb-access-token");

  /**
   * Belum login
   * tapi buka protected page
   */
  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /**
   * Sudah login
   * tapi buka login/register
   */
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(
      new URL("/home", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};