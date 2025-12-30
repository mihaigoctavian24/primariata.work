import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Authentication Middleware
 *
 * Protects routes requiring authentication:
 * - /app/** - Dashboard and authenticated pages
 *
 * Redirects:
 * - Unauthenticated users → /auth/login
 * - Authenticated users accessing /auth/** → /app/[judet]/[localitate]
 */

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes pattern: /app/**
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/app");

  // Auth routes pattern: /auth/**
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    // Try to get user's saved location from cookies or default
    const savedLocation = request.cookies.get("selected_location")?.value;
    let redirectPath = "/app/bucuresti/sector-1"; // Default

    if (savedLocation) {
      try {
        const { judetSlug, localitateSlug } = JSON.parse(savedLocation);
        redirectPath = `/app/${judetSlug}/${localitateSlug}`;
      } catch (e) {
        console.error("Failed to parse saved location:", e);
      }
    }

    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
