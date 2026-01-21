import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth Callback Route Handler
 *
 * Handles the OAuth callback from third-party providers (Google, etc.)
 * Exchanges the authorization code for a session and redirects the user.
 *
 * Route: /auth/callback
 * Method: GET
 * Query Params:
 *   - code: Authorization code from OAuth provider
 *   - next: Optional redirect destination after login
 *
 * Related: Issue #59 - Google OAuth Integration
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync location from cookie to database after successful authentication
      const cookieStore = await cookies();
      const locationCookie = cookieStore.get("selected_location");

      if (locationCookie?.value) {
        try {
          const savedLocation = JSON.parse(decodeURIComponent(locationCookie.value));

          // Sync location to database
          if (savedLocation.localitateId) {
            console.log("[auth/callback] Syncing location to database:", {
              localitateId: savedLocation.localitateId,
            });

            // Get current user
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Get primarie_id for the selected localitate
              const { data: primarie } = await supabase
                .from("primarii")
                .select("id")
                .eq("localitate_id", parseInt(savedLocation.localitateId))
                .single();

              if (primarie) {
                // Update utilizatori table with location data
                const { error: updateError } = await supabase
                  .from("utilizatori")
                  .update({
                    localitate_id: parseInt(savedLocation.localitateId),
                    primarie_id: primarie.id,
                  })
                  .eq("id", user.id);

                if (updateError) {
                  console.error("[auth/callback] Failed to sync location:", updateError);
                } else {
                  console.log("[auth/callback] ✅ Location synced successfully to database");
                }
              }
            }
          }
        } catch (e) {
          console.error("[auth/callback] Failed to sync location:", e);
          // Don't block auth flow if location sync fails
        }
      }

      // Determine redirect destination
      let redirectPath = next;

      // If no specific redirect, check for saved location from cookie (server-side)
      if (redirectPath === "/") {
        if (locationCookie?.value) {
          try {
            const savedLocation = JSON.parse(decodeURIComponent(locationCookie.value));
            if (savedLocation.judetSlug && savedLocation.localitateSlug) {
              redirectPath = `/app/${savedLocation.judetSlug}/${savedLocation.localitateSlug}`;
            }
          } catch (e) {
            console.error("[auth/callback] Failed to parse location cookie:", e);
            // Fallback to homepage if cookie is corrupted
          }
        }
      }

      // Ensure redirect path is relative
      if (!redirectPath.startsWith("/")) {
        redirectPath = "/";
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // If there's an error or no code, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
