import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Admin OAuth Callback Route Handler
 *
 * Handles OAuth callback for admin platform only
 * Always redirects to /admin/survey after successful authentication
 *
 * Route: /admin/auth/callback
 * Method: GET
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Always redirect to admin survey dashboard
      return NextResponse.redirect(`${origin}/admin/survey`);
    }
  }

  // If there's an error or no code, redirect to admin login with error
  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
