"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

// ============================================================================
// Types
// ============================================================================

export interface AuthContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  primarieId: string;
}

// ============================================================================
// getAuthContext
// ============================================================================

/**
 * Shared auth context helper for Server Actions.
 * Extracts authenticated user and primarie ID from the request context.
 *
 * @returns AuthContext on success, or { error: string } on failure.
 *
 * @example
 * ```typescript
 * const ctx = await getAuthContext();
 * if ("error" in ctx) return { success: false, error: ctx.error };
 * const { supabase, userId, primarieId } = ctx;
 * ```
 */
export async function getAuthContext(): Promise<AuthContext | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Autentificare necesara" };
  }

  const headersList = await headers();
  const primarieId = headersList.get("x-primarie-id");

  if (!primarieId) {
    return { error: "Primaria nu a fost identificata" };
  }

  return { supabase, userId: user.id, primarieId };
}
