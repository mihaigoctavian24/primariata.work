import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware for Authentication and Session Management
 *
 * This middleware:
 * 1. Refreshes Supabase sessions on every request
 * 2. Protects routes that require authentication (/app/*)
 * 3. Redirects unauthenticated users to /login with redirectTo param
 *
 * Protected Routes:
 * - /app/* - Requires authentication (main app routes)
 *
 * Public Routes:
 * - / - Landing page
 * - /login - Login page
 * - /register - Registration page
 * - All other routes
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function middleware(request: NextRequest) {
  // Update session and get current user
  const { supabaseResponse, user } = await updateSession(request);

  // Protected routes - require authentication
  const protectedPaths = ["/app"];
  const isProtectedRoute = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing auth pages while already authenticated
  const authPaths = ["/login", "/register"];
  const isAuthRoute = authPaths.some((path) => request.nextUrl.pathname === path);

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return supabaseResponse;
}

/**
 * Matcher Configuration
 *
 * Match all paths except:
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 * - Public files (images, fonts, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
