import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Update user session in middleware
 *
 * This function:
 * 1. Creates a Supabase client configured for middleware
 * 2. Refreshes the user's session if expired
 * 3. Returns updated response with new session cookies
 *
 * IMPORTANT: This must be called in middleware.ts for every request
 * to ensure sessions are refreshed and cookies are properly managed.
 *
 * @param request - Next.js request object
 * @returns Object containing the updated response and current user
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   const { supabaseResponse, user } = await updateSession(request)
 *
 *   // Add your auth logic here
 *   if (!user && request.nextUrl.pathname.startsWith('/app')) {
 *     return NextResponse.redirect(new URL('/login', request.url))
 *   }
 *
 *   return supabaseResponse
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  // Create a response object to mutate with updated cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request for Server Components to read
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          // Create new response with updated request cookies
          supabaseResponse = NextResponse.next({
            request,
          });

          // Set cookies on the response to send back to browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
