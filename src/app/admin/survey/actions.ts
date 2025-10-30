"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Admin logout action
 * Signs out the user and redirects to the survey page
 */
export async function logoutAndRedirect() {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Redirect to survey page
  redirect("/survey");
}
