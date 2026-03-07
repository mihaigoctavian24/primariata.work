"use server";

import { getAuthContext } from "@/lib/auth/get-auth-context";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// approveUser
// ============================================================================

/**
 * Approve a pending user registration.
 * Sets utilizatori.activ=true, utilizatori.status="activ"
 * and user_primarii.status="approved" for the current primarie.
 */
export async function approveUser(userId: string): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const admin = createServiceRoleClient();

  const { error: utilizatoriError } = await admin
    .from("utilizatori")
    .update({ activ: true, status: "activ" })
    .eq("id", userId);

  if (utilizatoriError) {
    return { success: false, error: utilizatoriError.message };
  }

  const { error: primarieError } = await admin
    .from("user_primarii")
    .update({ status: "approved" })
    .eq("user_id", userId)
    .eq("primarie_id", ctx.primarieId);

  if (primarieError) {
    return { success: false, error: primarieError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// ============================================================================
// suspendUser
// ============================================================================

/**
 * Suspend an active user.
 * Sets utilizatori.activ=false, utilizatori.status="suspendat"
 * and user_primarii.status="suspended" for the current primarie.
 */
export async function suspendUser(userId: string): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const admin = createServiceRoleClient();

  const { error: utilizatoriError } = await admin
    .from("utilizatori")
    .update({ activ: false, status: "suspendat" })
    .eq("id", userId);

  if (utilizatoriError) {
    return { success: false, error: utilizatoriError.message };
  }

  const { error: primarieError } = await admin
    .from("user_primarii")
    .update({ status: "suspended" })
    .eq("user_id", userId)
    .eq("primarie_id", ctx.primarieId);

  if (primarieError) {
    return { success: false, error: primarieError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// ============================================================================
// reactivateUser
// ============================================================================

/**
 * Reactivate a suspended user.
 * Sets utilizatori.activ=true, utilizatori.status="activ"
 * and user_primarii.status="approved" for the current primarie.
 */
export async function reactivateUser(userId: string): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const admin = createServiceRoleClient();

  const { error: utilizatoriError } = await admin
    .from("utilizatori")
    .update({ activ: true, status: "activ" })
    .eq("id", userId);

  if (utilizatoriError) {
    return { success: false, error: utilizatoriError.message };
  }

  const { error: primarieError } = await admin
    .from("user_primarii")
    .update({ status: "approved" })
    .eq("user_id", userId)
    .eq("primarie_id", ctx.primarieId);

  if (primarieError) {
    return { success: false, error: primarieError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
