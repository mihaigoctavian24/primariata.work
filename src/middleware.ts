import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CsrfError } from "@edge-csrf/nextjs";
import { csrfProtect } from "@/lib/security/csrf";
import { logger } from "@/lib/logger";

/**
 * Application Middleware
 *
 * Handles in order:
 * 1. Supabase session refresh
 * 2. Auth redirects (login/logout)
 * 3. Primarie context resolution from URL slugs
 * 4. User association validation (defense in depth)
 * 5. CSRF protection (skip webhooks, safe methods)
 * 6. x-primarie-id header injection for downstream consumption
 */
/**
 * Create a redirect response that preserves Supabase session cookies.
 * Without copying cookies, redirects destroy the session and cause auth loops.
 */
function redirectWithCookies(url: URL, sourceResponse: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirectResponse;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // --- Supabase session refresh ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
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

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/app");
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/auth/logout");
  const isWebhookRoute =
    request.nextUrl.pathname.startsWith("/api/webhooks/") ||
    request.nextUrl.pathname === "/api/plati/webhook";
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  // --- Auth redirects ---
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";

    // Sanitize redirectTo: don't preserve admin paths (would cause redirect loop for non-admins)
    const originalPath = request.nextUrl.pathname;
    if (!originalPath.includes("/admin")) {
      url.searchParams.set("redirectTo", originalPath);
    }

    return redirectWithCookies(url, supabaseResponse);
  }

  if (isAuthRoute && user) {
    const savedLocation = request.cookies.get("selected_location")?.value;
    let redirectPath = "/app/bucuresti/sector-1-b";

    if (savedLocation) {
      try {
        const { judetSlug, localitateSlug } = JSON.parse(savedLocation);
        redirectPath = `/app/${judetSlug}/${localitateSlug}`;
      } catch {
        logger.warn("Failed to parse saved location cookie");
      }
    }

    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return redirectWithCookies(url, supabaseResponse);
  }

  // --- Admin route protection ---
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return redirectWithCookies(url, supabaseResponse);
  }

  // --- Survey Admin route ---
  // /admin/* is the Survey Admin panel. Only authentication is required (handled above).
  // No user_primarii role check needed -- Survey Admin access control is handled by its own pages.

  // --- Primarie context resolution ---
  const appRouteMatch = request.nextUrl.pathname.match(/^\/app\/([^/]+)\/([^/]+)/);

  if (appRouteMatch && user) {
    const [, judetSlug, localitateSlug] = appRouteMatch;

    // Service role client to bypass RLS for slug resolution (public data lookup)
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op: service client does not manage browser cookies
          },
        },
      }
    );

    // Resolve judet + localitate slugs to primarie_id
    // Join path: primarii -> localitati (via localitate_id) -> judete (via judet_id)
    const { data: primarie } = await serviceClient
      .from("primarii")
      .select("id, localitati!inner(slug, judete!inner(slug))")
      .eq("localitati.slug", localitateSlug)
      .eq("localitati.judete.slug", judetSlug)
      .eq("activa", true)
      .single();

    if (primarie) {
      requestHeaders.set("x-primarie-id", primarie.id);

      // Check for active super admin impersonation session
      const impersonationCookie = request.cookies.get("sa_impersonation")?.value;
      let isImpersonating = false;
      if (impersonationCookie) {
        try {
          const impersonationData = JSON.parse(impersonationCookie) as {
            impersonating: boolean;
            targetPrimarieId: string;
          };
          if (
            impersonationData.impersonating &&
            impersonationData.targetPrimarieId === primarie.id
          ) {
            isImpersonating = true;
          }
        } catch {
          // Invalid cookie — ignore
        }
      }

      // Defense in depth: validate user has approved association
      const { data: association } = await serviceClient
        .from("user_primarii")
        .select("id, status, rol")
        .eq("user_id", user.id)
        .eq("primarie_id", primarie.id)
        .single();

      if (!isImpersonating && (!association || association.status !== "approved")) {
        // User not registered or not approved at this primarie
        // Allow public primarie page, block protected modules
        const protectedModules = [
          "/cereri",
          "/plati",
          "/documente",
          "/admin",
          "/setari",
          "/notificari",
        ];
        const pathAfterLocalitate = request.nextUrl.pathname.replace(/^\/app\/[^/]+\/[^/]+/, "");

        if (protectedModules.some((mod) => pathAfterLocalitate.startsWith(mod))) {
          logger.security({
            type: "rls",
            action: "access_denied",
            userId: user.id,
            success: false,
            metadata: {
              primarieId: primarie.id,
              path: request.nextUrl.pathname,
              reason: association ? `status: ${association.status}` : "no association",
            },
          });

          // Redirect to the primarie public dashboard (root of /app/[judet]/[localitate])
          if (pathAfterLocalitate.length > 0) {
            const url = request.nextUrl.clone();
            url.pathname = `/app/${judetSlug}/${localitateSlug}`;
            return redirectWithCookies(url, supabaseResponse);
          }
        }
      } else if (!isImpersonating && association && association.status === "approved") {
        // Regular approved user (not impersonating): apply staff role enforcement
        const adminRoles = ["admin", "functionar", "primar", "super_admin"];
        const isStaffUser = adminRoles.includes(association.rol);
        const pathAfterLocalitateForAdmin = request.nextUrl.pathname.replace(
          /^\/app\/[^/]+\/[^/]+/,
          ""
        );

        // Admin sub-path enforcement (SEC-01, SEC-02)
        // Only users with admin/staff roles at this primarie can access /app/[judet]/[localitate]/admin/*
        if (pathAfterLocalitateForAdmin.startsWith("/admin") && !isStaffUser) {
          logger.security({
            type: "auth",
            action: "access_denied",
            userId: user.id,
            success: false,
            metadata: {
              primarieId: primarie.id,
              path: request.nextUrl.pathname,
              role: association.rol,
            },
          });

          const url = request.nextUrl.clone();
          url.pathname = `/app/${judetSlug}/${localitateSlug}`;
          return redirectWithCookies(url, supabaseResponse);
        }

        // Admin route isolation: block staff users from citizen dashboard routes
        // Staff users on citizen routes (not /admin/*) get redirected to admin dashboard
        if (isStaffUser && !pathAfterLocalitateForAdmin.startsWith("/admin")) {
          const url = request.nextUrl.clone();
          url.pathname = `/app/${judetSlug}/${localitateSlug}/admin`;
          return redirectWithCookies(url, supabaseResponse);
        }

        // Log primarie context switch
        logger.security({
          type: "auth",
          action: "primarie_switch",
          userId: user.id,
          success: true,
          metadata: {
            primarieId: primarie.id,
            judet: judetSlug,
            localitate: localitateSlug,
          },
        });
      }
      // isImpersonating === true: super admin bypasses all association checks above

      // Cross-primarie guard: redirect users to their own primarie if they navigate to a different one
      // Uses the saved location cookie as the source of truth for the user's primarie
      const savedLocation = request.cookies.get("selected_location")?.value;
      if (savedLocation && association?.status === "approved") {
        try {
          const { judetSlug: savedJudet, localitateSlug: savedLocalitate } =
            JSON.parse(savedLocation);
          if (
            savedJudet &&
            savedLocalitate &&
            (savedJudet !== judetSlug || savedLocalitate !== localitateSlug)
          ) {
            const url = request.nextUrl.clone();
            url.pathname = `/app/${savedJudet}/${savedLocalitate}`;
            return redirectWithCookies(url, supabaseResponse);
          }
        } catch {
          // Invalid cookie format -- proceed without redirect
        }
      }

      // Rebuild supabaseResponse to include the updated headers (with x-primarie-id)
      supabaseResponse = NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  }

  // --- CSRF protection ---
  // Skip for webhook routes (they use HMAC verification instead)
  // Skip for safe methods (GET, HEAD, OPTIONS)
  // Skip for Next.js Server Actions (they have built-in CSRF via Next-Action header + origin check)
  const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method);
  const isServerAction = request.headers.has("Next-Action");

  if (!isWebhookRoute && !isSafeMethod && !isServerAction) {
    try {
      await csrfProtect(request, supabaseResponse);
    } catch (err) {
      if (err instanceof CsrfError) {
        logger.security({
          type: "csrf",
          action: "csrf_failure",
          userId: user?.id,
          success: false,
          metadata: {
            path: request.nextUrl.pathname,
            method: request.method,
          },
        });
        return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
      }
      throw err;
    }
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
    "/((?!_next/static|_next/image|_betterstack|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
