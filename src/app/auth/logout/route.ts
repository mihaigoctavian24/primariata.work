import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

/**
 * GET /auth/logout
 * Server-side logout: destroys Supabase session and redirects to landing page.
 * Using GET because this is navigated to via link/redirect, not form submission.
 */
export async function GET(): Promise<NextResponse | never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
